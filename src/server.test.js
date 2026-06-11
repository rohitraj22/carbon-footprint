import { describe, it, expect } from 'vitest';
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
});
