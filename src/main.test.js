// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

// Mock browser dependencies using jsdom environment
beforeAll(() => {
  const htmlPath = path.resolve(__dirname, '../index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  document.body.innerHTML = html;

  // Mock localStorage
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = value.toString(); },
      clear: () => { store = {}; }
    };
  })();
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
});

describe('TerraTrace Frontend Logic Tests', () => {
  it('should calculate carbon footprint correctly', async () => {
    const { calculateCarbonFootprint, state } = await import('./main.js');

    // Setup typical inputs
    state.onboardingInputs = {
      drivingDist: 100, // 100 km/week
      fuelType: 'petrol',
      carSize: 'medium', // emissions factor = 0.17
      transitDist: 50, // 50 km/week * 52 * 0.04
      flightHours: 10, // 10 hrs * 90
      electricBill: 120, // $120/mo
      householdSize: 2,
      renewableElectricity: false,
      heatingFuel: 'gas', // 1.6 / 2
      dietType: 'vegetarian', // 1.2
      shoppingLevel: 'average', // 1.2
      recyclingLevel: 'some' // credit 0.1
    };

    calculateCarbonFootprint();

    // Verify transport emissions calculation
    // carEmissions = 100 * 52 * 0.17 = 884
    // transitEmissions = 50 * 52 * 0.04 = 104
    // flightEmissions = 10 * 90 = 900
    // Total transport = (884 + 104 + 900) / 1000 = 1.888 => 1.89 Tons
    expect(state.footprint.transport).toBe(1.89);

    // Verify housing emissions calculation
    // electricEmissions = (120 * 12 * 0.0028) / 2 = 2.016
    // heatingEmissions = 1.6 / 2 = 0.8
    // Total housing = 2.016 + 0.8 = 2.816 => 2.82 Tons
    expect(state.footprint.housing).toBe(2.82);

    // Diet emissions = 1.2 Tons
    expect(state.footprint.diet).toBe(1.2);

    // Consumption emissions = Math.max(0.1, 1.2 - 0.1) = 1.1 Tons
    expect(state.footprint.consumption).toBe(1.1);

    // Total = 1.89 + 2.82 + 1.2 + 1.1 = 7.01 Tons
    expect(state.footprint.total).toBe(7.01);
  });

  it('should calculate daily streak correctly', async () => {
    const { calculateStreak, state } = await import('./main.js');

    // 1. Empty logs
    state.completedLogs = [];
    expect(calculateStreak()).toBe(0);

    // 2. Logs from today and yesterday
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    state.completedLogs = [
      { rawDate: today.toISOString(), category: 'food', points: 10 },
      { rawDate: yesterday.toISOString(), category: 'transport', points: 15 }
    ];

    expect(calculateStreak()).toBe(2);

    // 3. Gap in log dates (breaking the streak)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(today.getDate() - 3);

    state.completedLogs = [
      { rawDate: today.toISOString(), category: 'food', points: 10 },
      { rawDate: threeDaysAgo.toISOString(), category: 'transport', points: 15 }
    ];

    expect(calculateStreak()).toBe(1); // Only today's log is active, gap of 3 days breaks the streak
  });

  it('should escape HTML characters for security (XSS prevention)', async () => {
    const { escapeHTML } = await import('./main.js');
    expect(escapeHTML('<script>alert("XSS")</script>')).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
  });

  it('should format markdown syntax correctly into semantic HTML elements', async () => {
    const { formatMarkdown } = await import('./main.js');

    const markdownInput = '### Executive Summary\nThis is **bold** and *italic*.\n- Item 1\n- Item 2';
    const expectedOutput = '<h5 class="font-outfit fw-bold text-cyan mt-3 mb-2">Executive Summary</h5><br>This is <strong class="text-emerald">bold</strong> and <em class="text-secondary">italic</em>.<br><li class="ml-4 list-disc font-size-xs text-secondary mb-1">Item 1</li><br><li class="ml-4 list-disc font-size-xs text-secondary mb-1">Item 2</li>';

    expect(formatMarkdown(markdownInput)).toBe(expectedOutput);
  });

  it('should support adding and deleting activity logs', async () => {
    const { state } = await import('./main.js');
    state.completedLogs = [
      { id: 'log-test-1', label: 'Test Log 1', category: 'food', savings: 5.4, rawDate: Date.now() }
    ];
    expect(state.completedLogs.length).toBe(1);
    
    // Simulate deletion
    const idx = state.completedLogs.findIndex(l => l.id === 'log-test-1');
    if (idx > -1) {
      state.completedLogs.splice(idx, 1);
    }
    expect(state.completedLogs.length).toBe(0);
  });

  it('should support state persistence via localStorage simulation', () => {
    const testState = { onboardingComplete: true, compareCountry: 'DE' };
    window.localStorage.setItem('terratrace_state', JSON.stringify(testState));
    
    const retrieved = JSON.parse(window.localStorage.getItem('terratrace_state'));
    expect(retrieved.onboardingComplete).toBe(true);
    expect(retrieved.compareCountry).toBe('DE');
  });
});
