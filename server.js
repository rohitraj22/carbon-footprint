import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API route for AI insights
app.post('/api/ai-insights', async (req, res) => {
  const { footprint, inputs, loggedSavingsKg, totalOffsetsTons } = req.body;

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
- Transport: ${footprint.transport} tons/year (Mileage: ${inputs.drivingDist}km/week, fuel: ${inputs.fuelType}, size: ${inputs.carSize}; transit: ${inputs.transitDist}km/week; flights: ${inputs.flightHours} hrs/yr).
- Housing: ${footprint.housing} tons/year (bill: $${inputs.electricBill}/mo, heating: ${inputs.heatingFuel}, renewable electricity: ${inputs.renewableElectricity}).
- Diet: ${inputs.dietType}.
- Consumption: ${inputs.shoppingLevel} shopping level, ${inputs.recyclingLevel} recycling level.
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

app.listen(PORT, () => {
  console.log(`TerraTrace backend listening on port ${PORT}`);
});
