import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../server.js';

describe('TerraTrace Express API Validation Tests', () => {
  it('should return 400 Bad Request if footprint data is missing or invalid', async () => {
    const res = await request(app)
      .post('/api/ai-insights')
      .send({
        inputs: { dietType: 'vegan', shoppingLevel: 'low' },
        loggedSavingsKg: 10,
        totalOffsetsTons: 2.5
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('footprint');
  });

  it('should return 400 Bad Request if inputs configuration is missing or invalid', async () => {
    const res = await request(app)
      .post('/api/ai-insights')
      .send({
        footprint: { total: 4.5, transport: 1.5, housing: 1.5, diet: 1.0, consumption: 0.5 },
        loggedSavingsKg: 10,
        totalOffsetsTons: 2.5
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('input');
  });

  it('should return 400 Bad Request if numeric metrics are missing or invalid types', async () => {
    const res = await request(app)
      .post('/api/ai-insights')
      .send({
        footprint: { total: 4.5, transport: 1.5, housing: 1.5, diet: 1.0, consumption: 0.5 },
        inputs: { dietType: 'vegan', shoppingLevel: 'low' },
        loggedSavingsKg: "ten", // String instead of Number
        totalOffsetsTons: 2.5
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('numeric');
  });

  it('should return 400 if API key is missing (for typical placeholder setup)', async () => {
    // If running without a valid GEMINI_API_KEY environment variable
    const oldKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

    const res = await request(app)
      .post('/api/ai-insights')
      .send({
        footprint: { total: 4.5, transport: 1.5, housing: 1.5, diet: 1.0, consumption: 0.5 },
        inputs: { dietType: 'vegan', shoppingLevel: 'low', drivingDist: 50, electricBill: 60, renewableElectricity: true },
        loggedSavingsKg: 10,
        totalOffsetsTons: 2.5
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('GEMINI_API_KEY');

    // Restore environment variable
    process.env.GEMINI_API_KEY = oldKey;
  });

  it('should return 200 OK and valid AI insight text when successful (mocked fetch)', async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: {
              parts: [{
                text: '### Executive Summary\nTest recommendation'
              }]
            }
          }]
        })
      });
    });

    const res = await request(app)
      .post('/api/ai-insights')
      .send({
        footprint: { total: 4.5, transport: 1.5, housing: 1.5, diet: 1.0, consumption: 0.5 },
        inputs: { dietType: 'vegan', shoppingLevel: 'low', drivingDist: 50, electricBill: 60, renewableElectricity: true },
        loggedSavingsKg: 10,
        totalOffsetsTons: 2.5
      });

    expect(res.status).toBe(200);
    expect(res.body.text).toContain('Executive Summary');

    // Restore original fetch
    global.fetch = originalFetch;
  });

  it('should allow CORS for localhost and onrender.com subdomains', async () => {
    const res1 = await request(app)
      .options('/api/ai-insights')
      .set('Origin', 'http://localhost:3000');
    expect(res1.headers['access-control-allow-origin']).toBe('http://localhost:3000');

    const res2 = await request(app)
      .options('/api/ai-insights')
      .set('Origin', 'https://test.onrender.com');
    expect(res2.headers['access-control-allow-origin']).toBe('https://test.onrender.com');
  });

  it('should block CORS for unauthorized domains', async () => {
    const res = await request(app)
      .options('/api/ai-insights')
      .set('Origin', 'https://maliciousdomain.com');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});
