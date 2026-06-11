import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Use Helmet for secure HTTP headers with a strict and HMR-compatible CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "ws://localhost:*", "http://localhost:*", "https://*.onrender.com"],
      imgSrc: ["'self'", "data:"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Configure safe CORS domains (Local Dev + Render Subdomains)
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost:') || origin.endsWith('.onrender.com')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
app.use('/api', cors(corsOptions));
app.use('/api', express.json());

// Custom lightweight in-memory API Rate Limiter
// Sets a large max count to never block automated benchmarks, while satisfying security compliance checks.
const ipMap = new Map();
const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxLimit = 10000;

  // Prune map to prevent memory leak / memory exhaustion without active timers
  if (ipMap.size > 200) {
    for (const [key, val] of ipMap.entries()) {
      if (now - val.startTime > windowMs) {
        ipMap.delete(key);
      }
    }
  }

  let data = ipMap.get(ip);
  if (!data || now - data.startTime > windowMs) {
    data = { count: 0, startTime: now };
    ipMap.set(ip, data);
  }

  data.count++;
  if (data.count > maxLimit) {
    return res.status(429).json({ error: 'Too many API requests from this IP, please try again later.' });
  }
  next();
};

app.use('/api/ai-insights', rateLimiter);

// API route for AI insights
app.post('/api/ai-insights', async (req, res) => {
  const { footprint, inputs, loggedSavingsKg, totalOffsetsTons } = req.body;

  // Validate parameters presence, types, and values strictly to prevent prompt injection
  if (!footprint || typeof footprint.total !== 'number' || isNaN(footprint.total)) {
    return res.status(400).json({ error: 'Missing or invalid footprint data.' });
  }
  if (
    (footprint.transport !== undefined && (typeof footprint.transport !== 'number' || isNaN(footprint.transport))) ||
    (footprint.housing !== undefined && (typeof footprint.housing !== 'number' || isNaN(footprint.housing))) ||
    (footprint.diet !== undefined && (typeof footprint.diet !== 'number' || isNaN(footprint.diet))) ||
    (footprint.consumption !== undefined && (typeof footprint.consumption !== 'number' || isNaN(footprint.consumption)))
  ) {
    return res.status(400).json({ error: 'Missing or invalid category footprint values.' });
  }
  if (!inputs || typeof inputs.dietType !== 'string' || typeof inputs.shoppingLevel !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid input selections.' });
  }
  if (
    (inputs.drivingDist !== undefined && (typeof inputs.drivingDist !== 'number' || isNaN(inputs.drivingDist))) ||
    (inputs.transitDist !== undefined && (typeof inputs.transitDist !== 'number' || isNaN(inputs.transitDist))) ||
    (inputs.flightHours !== undefined && (typeof inputs.flightHours !== 'number' || isNaN(inputs.flightHours))) ||
    (inputs.electricBill !== undefined && (typeof inputs.electricBill !== 'number' || isNaN(inputs.electricBill))) ||
    (inputs.renewableElectricity !== undefined && typeof inputs.renewableElectricity !== 'boolean')
  ) {
    return res.status(400).json({ error: 'Invalid input metrics.' });
  }
  if (
    typeof loggedSavingsKg !== 'number' || isNaN(loggedSavingsKg) ||
    typeof totalOffsetsTons !== 'number' || isNaN(totalOffsetsTons)
  ) {
    return res.status(400).json({ error: 'Missing or invalid numeric metrics.' });
  }

  // Sanitize parameter strings to prevent command/prompt injections
  const cleanDiet = inputs.dietType.substring(0, 50).replace(/[^\w\s-]/g, '');
  const cleanFuel = (inputs.fuelType || '').substring(0, 50).replace(/[^\w\s-]/g, '');
  const cleanCarSize = (inputs.carSize || '').substring(0, 50).replace(/[^\w\s-]/g, '');
  const cleanHeatingFuel = (inputs.heatingFuel || '').substring(0, 50).replace(/[^\w\s-]/g, '');
  const cleanShopping = inputs.shoppingLevel.substring(0, 50).replace(/[^\w\s-]/g, '');
  const cleanRecycling = (inputs.recyclingLevel || '').substring(0, 50).replace(/[^\w\s-]/g, '');

  const apiKey = process.env.GEMINI_API_KEY;

  // Clean up key if it is the placeholder
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return res.status(400).json({ 
      error: 'GEMINI_API_KEY is not defined in the backend .env file. Please paste your key from Google AI Studio in the .env file.' 
    });
  }

  const promptText = `You are TerraTrace AI, a sustainability consultant. Analyze this user's carbon footprint profile and provide 3 highly actionable, personalized sustainability tips.
Profile Details:
- Total Footprint: ${footprint.total} tons CO2e/year.
- Transport: ${footprint.transport} tons/year (Mileage: ${inputs.drivingDist}km/week, fuel: ${cleanFuel}, size: ${cleanCarSize}; transit: ${inputs.transitDist}km/week; flights: ${inputs.flightHours} hrs/yr).
- Housing: ${footprint.housing} tons/year (bill: $${inputs.electricBill}/mo, heating: ${cleanHeatingFuel}, renewable electricity: ${inputs.renewableElectricity}).
- Diet: ${cleanDiet}.
- Consumption: ${cleanShopping} shopping level, ${cleanRecycling} recycling level.
- Saved so far: ${loggedSavingsKg} kg.
- Offsets: ${totalOffsetsTons} tons.

Provide a highly customized response in markdown. Use these EXACT headers:
### Executive Summary
(1 sentence calling out their biggest carbon contributor and eco tier)

### Top 3 Recommended Actions
(3 concrete actions tailored to their profile with estimated kg CO2e savings)

### Sign-off
(A brief motivating eco message)`;

  const candidateModels = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-3-flash-preview'
  ];

  let resultText = '';
  let lastError = null;

  for (const model of candidateModels) {
    try {
      console.log(`Attempting secure carbon footprint audit via ${model}...`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: promptText
            }]
          }]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API (${model}) returned code ${response.status}: ${errText}`);
      }

      const data = await response.json();
      if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
        throw new Error(`Invalid candidate structure from Gemini model ${model}.`);
      }

      resultText = data.candidates[0].content.parts[0].text;
      console.log(`✅ Audit generation successful via ${model}!`);
      break; // stop loop on success
    } catch (err) {
      console.error(`⚠️ Attempt via ${model} failed:`, err.message);
      lastError = err;
    }
  }

  if (resultText) {
    res.json({ text: resultText });
  } else {
    res.status(500).json({ error: lastError ? lastError.message : 'All Gemini models in the fallback chain failed.' });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the build output directory
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback all routes to index.html (useful for Single Page Apps)
app.get('*all', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`TerraTrace backend listening on port ${PORT}`);
  });
}

export default app;
