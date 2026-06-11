/* ==========================================================================
   TerraTrace - Core Application Logic
   ========================================================================== */

// --- Database of Carbon Reduction Actions ---
const REDUCTION_ACTIONS = [
  {
    id: 'action-1',
    title: 'Switch to LED Bulbs',
    category: 'energy',
    savings: 150, // kg CO2e/year
    difficulty: 'Easy',
    desc: 'Replace 10 traditional incandescent bulbs with energy-efficient LEDs to cut lighting waste.'
  },
  {
    id: 'action-2',
    title: 'Go Meatless Mondays',
    category: 'food',
    savings: 320,
    difficulty: 'Easy',
    desc: 'Commit to eating 100% plant-based meals one day per week.'
  },
  {
    id: 'action-3',
    title: 'Bike to Work & Errands',
    category: 'transport',
    savings: 650,
    difficulty: 'Medium',
    desc: 'Commute by bicycle or walk instead of driving for short-distance trips under 6 km.'
  },
  {
    id: 'action-4',
    title: 'Thermostat Adjustment',
    category: 'energy',
    savings: 280,
    difficulty: 'Easy',
    desc: 'Lower winter heating by 2°C and raise summer AC cooling by 2°C.'
  },
  {
    id: 'action-5',
    title: 'Line-Dry Laundry',
    category: 'energy',
    savings: 190,
    difficulty: 'Easy',
    desc: 'Hang dry clothes instead of using a tumble dryer for 70% of laundry cycles.'
  },
  {
    id: 'action-6',
    title: 'Use Public Transit',
    category: 'transport',
    savings: 850,
    difficulty: 'Medium',
    desc: 'Switch to bus, subway, or rail transit for your primary workplace commute.'
  },
  {
    id: 'action-7',
    title: 'Transition to Vegan Diet',
    category: 'food',
    savings: 1100,
    difficulty: 'Hard',
    desc: 'Transition to a fully plant-based diet to completely bypass commercial livestock emissions.'
  },
  {
    id: 'action-8',
    title: 'Zero-Waste Groceries',
    category: 'lifestyle',
    savings: 130,
    difficulty: 'Medium',
    desc: 'Bring reusable grocery bags, reuse bulk jars, and boycott single-use plastics.'
  },
  {
    id: 'action-9',
    title: 'Install Rooftop Solar',
    category: 'energy',
    savings: 1950,
    difficulty: 'Hard',
    desc: 'Install solar PV panels to provide clean energy directly to your household.'
  }
];

// --- Loggable Activities (Daily) ---
const DAILY_ACTIVITIES = {
  food: [
    { id: 'log-food-1', label: '100% Plant-Based Eating Day', savings: 5.4 },
    { id: 'log-food-2', label: 'Locally Sourced Organic Meal', savings: 1.6 },
    { id: 'log-food-3', label: 'Composted All Kitchen Waste', savings: 0.8 }
  ],
  transport: [
    { id: 'log-trans-1', label: 'Commuted by Rail/Transit (20km)', savings: 8.5 },
    { id: 'log-trans-2', label: 'Biked/Walked for Transit (8km)', savings: 3.8 },
    { id: 'log-trans-3', label: 'Carpooled with 3+ Passengers', savings: 5.2 },
    { id: 'log-trans-4', label: 'Worked from Home / No Commute', savings: 9.8 }
  ],
  energy: [
    { id: 'log-energy-1', label: 'Cold-Water Wash & Line Dry', savings: 1.4 },
    { id: 'log-energy-2', label: 'Unplugged Phantom/Standby Load', savings: 0.7 },
    { id: 'log-energy-3', label: 'Minimized HVAC / Natural Air Day', savings: 3.2 }
  ],
  lifestyle: [
    { id: 'log-life-1', label: 'Recycled All Plastic/Glass/Paper', savings: 1.1 },
    { id: 'log-life-2', label: 'Bought Pre-owned Item (No New)', savings: 4.8 },
    { id: 'log-life-3', label: 'Used Reusable Containers/Cups', savings: 0.5 }
  ]
};

// --- Offset Projects ---
const OFFSET_PROJECTS = [
  {
    id: 'proj-1',
    title: 'Amazon Rainforest Protection',
    location: 'Acre State, Brazil',
    costPerTon: 15,
    desc: 'Prevents deforestation in vulnerable areas of the Amazon basin, preserving native habitats and storing carbon.',
    imageIcon: '🌳'
  },
  {
    id: 'proj-2',
    title: 'Vindhyachal Wind Power Grid',
    location: 'Madhya Pradesh, India',
    costPerTon: 8,
    desc: 'Replaces fossil energy by feed-in of wind generated power to local grids, accelerating cleaner grid transitions.',
    imageIcon: '💨'
  },
  {
    id: 'proj-3',
    title: 'Clean Biomass Cookstoves',
    location: 'Nyanza Province, Kenya',
    costPerTon: 10,
    desc: 'Distributes fuel-efficient stoves to rural households, saving firewood, protecting local canopies, and purifying air.',
    imageIcon: '🔥'
  }
];

// --- Core Application State ---
let state = {
  onboardingComplete: false,
  footprint: {
    transport: 0,
    housing: 0,
    diet: 0,
    consumption: 0,
    total: 0
  },
  onboardingInputs: {
    drivingDist: 100,
    fuelType: 'petrol',
    carSize: 'medium',
    transitDist: 20,
    flightHours: 4,
    householdSize: 1,
    electricBill: 60,
    renewableElectricity: false,
    heatingFuel: 'gas',
    dietType: 'heavy-meat',
    shoppingLevel: 'average',
    recyclingLevel: 'some'
  },
  committedActions: [], // Action IDs
  completedLogs: [],    // Log entries: { id, label, category, savings, timestamp, rawDate }
  offsets: {
    'proj-1': 0, // Metric Tons
    'proj-2': 0,
    'proj-3': 0
  },
  compareCountry: 'US',
  projectionYears: 5
};

// --- Constants & Config ---
const GAUGE_CIRCUMFERENCE = 515.22; // 2 * pi * r (r=82)

// --- Load and Save State ---
function loadState() {
  const saved = localStorage.getItem('terratrace_state');
  if (saved) {
    try {
      state = JSON.parse(saved);
    } catch (e) {
      console.error('Error loading saved state. Using defaults.', e);
    }
  }
}

function saveState() {
  localStorage.setItem('terratrace_state', JSON.stringify(state));
}

// --- Initialize Application ---
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  initRouter();
  initOnboardingWizard();
  initForms();
  
  // Custom tools event listeners
  const projSlider = document.getElementById('projection-slider');
  const projLabel = document.getElementById('val-projection-years');
  if (projSlider && projLabel) {
    projSlider.value = state.projectionYears || 5;
    projLabel.textContent = `${projSlider.value} Years`;
    
    projSlider.addEventListener('input', (e) => {
      state.projectionYears = parseInt(e.target.value);
      projLabel.textContent = `${state.projectionYears} ${state.projectionYears === 1 ? 'Year' : 'Years'}`;
      updateProjectionImpactOnly();
      saveState();
    });
  }

  const countrySelect = document.getElementById('country-compare-select');
  if (countrySelect) {
    countrySelect.value = state.compareCountry || 'US';
    
    countrySelect.addEventListener('change', (e) => {
      state.compareCountry = e.target.value;
      renderApp();
      saveState();
    });
  }

  initAIInsightsModal();
  renderApp();
  startLiveCarbonClock();
  
  // Show onboarding modal if not complete
  if (!state.onboardingComplete) {
    showModal(true);
  }
});

// --- Onboarding Modal Wizard Controls ---
let currentWizardStep = 1;

function initOnboardingWizard() {
  const modal = document.getElementById('onboarding-modal');
  const onboardingForm = document.getElementById('onboarding-form');
  const nextBtns = document.querySelectorAll('.next-step-btn');
  const prevBtns = document.querySelectorAll('.prev-step-btn');
  const steps = document.querySelectorAll('.wizard-step');
  const stepIndicator = document.getElementById('wizard-step-indicator');
  const progress = document.getElementById('wizard-progress');

  // Household badge selector
  const hhBadges = document.querySelectorAll('#household-size-selector .select-badge');
  hhBadges.forEach(badge => {
    badge.addEventListener('click', () => {
      hhBadges.forEach(b => b.classList.remove('active'));
      badge.classList.add('active');
      state.onboardingInputs.householdSize = parseInt(badge.dataset.size);
    });
  });

  // Diet Card Selectors
  const dietCards = document.querySelectorAll('.diet-option-card');
  dietCards.forEach(card => {
    card.addEventListener('click', () => {
      dietCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const radio = card.querySelector('input[type="radio"]');
      radio.checked = true;
      state.onboardingInputs.dietType = card.dataset.diet;
    });
  });

  // Sliders visual indicators sync
  const registerSlider = (sliderId, indicatorId, suffix) => {
    const slider = document.getElementById(sliderId);
    const indicator = document.getElementById(indicatorId);
    if (slider && indicator) {
      slider.addEventListener('input', (e) => {
        indicator.textContent = `${e.target.value}${suffix}`;
      });
    }
  };

  registerSlider('onboard-driving-dist', 'val-driving-dist', ' km');
  registerSlider('onboard-transit-dist', 'val-transit-dist', ' km');
  registerSlider('onboard-flight-hours', 'val-flight-hours', ' hours');
  registerSlider('onboard-electric-bill', 'val-electric-bill', ' $');

  // Wizard movement
  const updateWizardStep = () => {
    steps.forEach((step) => {
      step.classList.remove('active');
      if (parseInt(step.dataset.step) === currentWizardStep) {
        step.classList.add('active');
      }
    });

    stepIndicator.textContent = `Step ${currentWizardStep} of 5`;
    progress.style.width = `${currentWizardStep * 20}%`;
  };

  nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentWizardStep < 5) {
        currentWizardStep++;
        updateWizardStep();
      }
    });
  });

  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentWizardStep > 1) {
        currentWizardStep--;
        updateWizardStep();
      }
    });
  });

  // Onboard Form submission
  onboardingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Pull values from forms
    state.onboardingInputs.drivingDist = parseFloat(document.getElementById('onboard-driving-dist').value);
    state.onboardingInputs.fuelType = document.getElementById('onboard-fuel-type').value;
    state.onboardingInputs.carSize = document.getElementById('onboard-car-size').value;
    state.onboardingInputs.transitDist = parseFloat(document.getElementById('onboard-transit-dist').value);
    state.onboardingInputs.flightHours = parseFloat(document.getElementById('onboard-flight-hours').value);
    state.onboardingInputs.electricBill = parseFloat(document.getElementById('onboard-electric-bill').value);
    state.onboardingInputs.renewableElectricity = document.getElementById('onboard-renewable-electricity').checked;
    state.onboardingInputs.heatingFuel = document.getElementById('onboard-heating-fuel').value;
    state.onboardingInputs.shoppingLevel = document.getElementById('onboard-shopping-level').value;
    state.onboardingInputs.recyclingLevel = document.getElementById('onboard-recycling-level').value;

    const checkedDiet = document.querySelector('input[name="diet-radio"]:checked');
    if (checkedDiet) {
      const card = checkedDiet.closest('.diet-option-card');
      if (card) {
        state.onboardingInputs.dietType = card.dataset.diet;
      }
    }

    // Set complete
    state.onboardingComplete = true;
    
    // Calculate results
    calculateCarbonFootprint();
    saveState();
    
    // UI Transitions
    showModal(false);
    renderApp();
  });

  // Recalculate Button click
  document.getElementById('recalc-btn').addEventListener('click', () => {
    currentWizardStep = 1;
    updateWizardStep();
    showModal(true);
  });
}

function showModal(show) {
  const modal = document.getElementById('onboarding-modal');
  if (show) {
    modal.classList.remove('d-none');
    modal.classList.add('d-flex');
  } else {
    modal.classList.add('d-none');
    modal.classList.remove('d-flex');
  }
}

// --- Navigation Router ---
function initRouter() {
  const navLinks = document.querySelectorAll('.nav-link');
  const views = document.querySelectorAll('.content-view');

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const target = link.dataset.target;
      views.forEach(view => {
        view.classList.remove('active');
        if (view.id === `view-${target}`) {
          view.classList.add('active');
        }
      });
    });
  });
}

// --- Carbon Calculations Formula ---
function calculateCarbonFootprint() {
  const inputs = state.onboardingInputs;
  const footprint = state.footprint;

  // 1. Transport Footprint (Tons CO2e per year)
  let carEmissionsFactor = 0.17; // Medium petrol car average (kg/km)
  if (inputs.fuelType === 'petrol') {
    carEmissionsFactor = inputs.carSize === 'small' ? 0.12 : inputs.carSize === 'large' ? 0.22 : 0.17;
  } else if (inputs.fuelType === 'diesel') {
    carEmissionsFactor = inputs.carSize === 'small' ? 0.11 : inputs.carSize === 'large' ? 0.20 : 0.15;
  } else if (inputs.fuelType === 'hybrid') {
    carEmissionsFactor = inputs.carSize === 'small' ? 0.08 : inputs.carSize === 'large' ? 0.13 : 0.10;
  } else if (inputs.fuelType === 'electric') {
    carEmissionsFactor = inputs.carSize === 'small' ? 0.03 : inputs.carSize === 'large' ? 0.05 : 0.04;
  }

  const annualCarDist = inputs.drivingDist * 52;
  const carEmissions = annualCarDist * carEmissionsFactor; // kg CO2e
  const transitEmissions = (inputs.transitDist * 52) * 0.04; // Bus/Train avg 0.04 kg/km
  const flightEmissions = inputs.flightHours * 90; // Average 90 kg CO2e per hour

  footprint.transport = parseFloat(((carEmissions + transitEmissions + flightEmissions) / 1000).toFixed(2));

  // 2. Housing & Utilities Footprint (Tons CO2e per year)
  let electricEmissions = 0;
  if (!inputs.renewableElectricity) {
    // Convert bill to emissions. Avg US household is ~$120/mo and produces ~4 tons electricity CO2e/year.
    // Let's assume $60 = 2 tons individual base. Divide by household members.
    electricEmissions = (inputs.electricBill * 12 * 0.0028) / inputs.householdSize; 
  }

  let heatingEmissions = 0;
  if (inputs.heatingFuel === 'gas') {
    heatingEmissions = 1.6 / inputs.householdSize;
  } else if (inputs.heatingFuel === 'oil') {
    heatingEmissions = 2.6 / inputs.householdSize;
  } else if (inputs.heatingFuel === 'electric') {
    heatingEmissions = inputs.renewableElectricity ? 0 : 1.1 / inputs.householdSize;
  }

  footprint.housing = parseFloat((electricEmissions + heatingEmissions).toFixed(2));

  // 3. Diet Footprint (Tons CO2e per year)
  let dietEmissions = 1.7; // Moderate meat
  if (inputs.dietType === 'heavy-meat') dietEmissions = 3.1;
  else if (inputs.dietType === 'vegetarian') dietEmissions = 1.2;
  else if (inputs.dietType === 'vegan') dietEmissions = 0.7;

  footprint.diet = dietEmissions;

  // 4. Consumption Footprint
  let shopEmissions = 1.2; // Average
  if (inputs.shoppingLevel === 'low') shopEmissions = 0.4;
  else if (inputs.shoppingLevel === 'high') shopEmissions = 2.4;

  let recyclingCredit = 0.1; // Recycle some
  if (inputs.recyclingLevel === 'most') recyclingCredit = 0.35;
  else if (inputs.recyclingLevel === 'none') recyclingCredit = 0.0;

  footprint.consumption = parseFloat(Math.max(0.1, shopEmissions - recyclingCredit).toFixed(2));

  // 5. Total Calculations
  footprint.total = parseFloat((footprint.transport + footprint.housing + footprint.diet + footprint.consumption).toFixed(2));
}

// --- Action & Logger Handlers ---
function initForms() {
  const logCategoryGrid = document.getElementById('log-categories-grid');
  const catBtns = logCategoryGrid.querySelectorAll('.log-cat-btn');
  const activitySelect = document.getElementById('log-activity-select');
  const dailyLogForm = document.getElementById('daily-log-form');

  // Filter list option builder
  const populateActivities = (category) => {
    activitySelect.innerHTML = '';
    const items = DAILY_ACTIVITIES[category] || [];
    items.forEach(item => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = `${item.label} (-${item.savings} kg CO₂e)`;
      option.dataset.savings = item.savings;
      option.dataset.label = item.label;
      activitySelect.appendChild(option);
    });
  };

  // Default selection
  populateActivities('food');

  // Category switch
  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.logCat;
      populateActivities(cat);
    });
  });

  // Daily Logger submission
  dailyLogForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const selectedOption = activitySelect.options[activitySelect.selectedIndex];
    if (!selectedOption) return;

    const activeCatBtn = logCategoryGrid.querySelector('.log-cat-btn.active');
    const category = activeCatBtn.dataset.logCat;
    const savings = parseFloat(selectedOption.dataset.savings);
    const label = selectedOption.dataset.label;

    // Add entry
    const newLog = {
      id: 'log-' + Date.now(),
      label: label,
      category: category,
      savings: savings,
      rawDate: Date.now(),
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    state.completedLogs.unshift(newLog); // Put first
    
    // Save state & render updates
    saveState();
    renderApp();
    
    // Show quick visual notification (success visual)
    showToastNotification(`Logged: ${label}! Reduced CO₂e by ${savings} kg.`);
  });
}

// Simple dynamic Toast notification
function showToastNotification(text) {
  const toast = document.createElement('div');
  toast.className = 'glass-panel-sm px-4 py-3 text-emerald font-outfit fw-bold';
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.right = '24px';
  toast.style.zIndex = '2000';
  toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
  toast.style.border = '1px solid var(--emerald)';
  toast.style.transform = 'translateY(50px)';
  toast.style.opacity = '0';
  toast.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  toast.textContent = text;

  document.body.appendChild(toast);
  
  // Force browser layout reflow
  toast.offsetHeight;

  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.transform = 'translateY(30px)';
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 450);
  }, 3000);
}

// --- Renders The Entire App UI ---
function renderApp() {
  if (!state.onboardingComplete) return;

  // 1. Calculate dynamic savings
  let annualCommittedSavingsKg = 0;
  state.committedActions.forEach(id => {
    const act = REDUCTION_ACTIONS.find(a => a.id === id);
    if (act) annualCommittedSavingsKg += act.savings;
  });

  let loggedSavingsKg = 0;
  state.completedLogs.forEach(log => {
    loggedSavingsKg += log.savings;
  });

  const totalOffsetsTons = Object.values(state.offsets).reduce((acc, curr) => acc + curr, 0);

  // Remaining footprint after committed reductions
  const rawFootprint = state.footprint.total;
  const committedTons = annualCommittedSavingsKg / 1000;
  const remainingFootprint = Math.max(0, rawFootprint - committedTons);
  const netFootprint = Math.max(0, remainingFootprint - totalOffsetsTons);

  // Update Global Header saved numbers
  document.getElementById('total-saved-pill').textContent = Math.round(loggedSavingsKg + (committedTons * 1000));
  
  // Update Dashboard Circular Gauge
  const gaugeScoreElement = document.getElementById('gauge-score');
  gaugeScoreElement.textContent = remainingFootprint.toFixed(1);

  // Animate Gauge Arc
  const maxFootprintScale = 20.0;
  const percentage = Math.min(1, remainingFootprint / maxFootprintScale);
  const strokeOffset = GAUGE_CIRCUMFERENCE - (percentage * GAUGE_CIRCUMFERENCE);
  const gaugeRing = document.getElementById('dashboard-gauge');
  gaugeRing.style.strokeDashoffset = strokeOffset;

  // Dynamic Gauge colors based on footprint score
  if (remainingFootprint <= 2.0) {
    gaugeRing.style.stroke = 'var(--emerald)';
    document.getElementById('gauge-status-desc').innerHTML = 'Excellent: <span class="text-emerald">Eco Champion</span>';
  } else if (remainingFootprint <= 6.0) {
    gaugeRing.style.stroke = 'var(--cyan)';
    document.getElementById('gauge-status-desc').innerHTML = 'Good: <span class="text-cyan">Pioneer</span>';
  } else if (remainingFootprint <= 12.0) {
    gaugeRing.style.stroke = 'var(--amber)';
    document.getElementById('gauge-status-desc').innerHTML = 'Moderate: <span class="text-amber">Transit User</span>';
  } else {
    gaugeRing.style.stroke = 'var(--rose)';
    document.getElementById('gauge-status-desc').innerHTML = 'High: <span class="text-rose">Heavy Output</span>';
  }

  // 2. Render Donut Chart
  renderDonutChart();

  // 3. Render Eco Impact Stat Cards (with Projection Simulator)
  document.getElementById('impact-co2-saved').textContent = `${Math.round(loggedSavingsKg)} kg`;
  updateProjectionImpactOnly();

  // Helper for hybrid country colors
  const getCountryColorClass = (val) => {
    if (val >= 12.0) return { text: 'text-amber', bg: 'bg-gradient-amber' };
    if (val >= 5.0) return { text: 'text-purple', bg: 'bg-gradient-purple' };
    return { text: 'text-cyan', bg: 'bg-gradient-cyan-blue' };
  };

  // 4. Render Compare Stack bars (Dynamic country select)
  const selectedCountry = state.compareCountry || 'US';
  const countriesData = {
    'US': { name: 'United States', short: 'US Avg', value: 16.0 },
    'DE': { name: 'Germany', short: 'Germany Avg', value: 8.2 },
    'UK': { name: 'United Kingdom', short: 'UK Avg', value: 5.2 },
    'CN': { name: 'China', short: 'China Avg', value: 8.0 },
    'IN': { name: 'India', short: 'India Avg', value: 2.0 },
    'BR': { name: 'Brazil', short: 'Brazil Avg', value: 2.2 },
    'GL': { name: 'Global Average', short: 'Global Avg', value: 4.8 }
  };
  
  const compareData = countriesData[selectedCountry] || countriesData['US'];
  document.getElementById('compare-country-label').textContent = `${compareData.name} Average`;
  document.getElementById('compare-country-value').textContent = `${compareData.value.toFixed(1)} T CO₂e`;
  
  const maxCompareVal = Math.max(remainingFootprint, compareData.value, 16.0);
  
  const userBarWidth = Math.max(3, (remainingFootprint / maxCompareVal) * 100);
  const targetBarWidth = (2.0 / maxCompareVal) * 100;
  const countryBarWidth = (compareData.value / maxCompareVal) * 100;

  document.getElementById('compare-user-value').textContent = `${remainingFootprint.toFixed(1)} T CO₂e`;
  document.getElementById('compare-user-bar').style.width = `${userBarWidth}%`;
  
  const targetBar = document.querySelector('.comparison-bar-item:nth-child(2) .progress-bar');
  if (targetBar) targetBar.style.width = `${targetBarWidth}%`;
  
  // Apply dynamic color mapping for the country chosen
  const countryColors = getCountryColorClass(compareData.value);
  const countryBar = document.getElementById('compare-country-bar');
  const countryVal = document.getElementById('compare-country-value');
  
  if (countryBar && countryVal) {
    countryBar.className = 'progress-bar';
    countryBar.classList.add(countryColors.bg);
    countryVal.className = `fw-bold ${countryColors.text}`;
  }
  
  countryBar.style.width = `${countryBarWidth}%`;

  // Align with gauge-footer country indicator
  const gaugeCountryCompare = document.getElementById('gauge-country-compare');
  if (gaugeCountryCompare) {
    gaugeCountryCompare.innerHTML = `${compareData.short}: <strong class="${countryColors.text}">${compareData.value.toFixed(1)} T</strong>`;
  }

  // 5. Smart Recommender (AI Insights)
  generateAIInsights();

  // 6. Action Hub Render
  renderActionHubGrid();

  // 7. Daily Logs List Render
  renderActivityLogsFeed();

  // 8. Milestone Upgrade Calculator
  renderMilestoneCard(loggedSavingsKg);

  // 9. Offset Simulator Dashboard Render
  renderOffsetsView(remainingFootprint, totalOffsetsTons, netFootprint);

  // 10. Update Streak Value
  const streakVal = calculateStreak();
  document.getElementById('streak-counter-val').textContent = streakVal;
}

// Donut Chart calculation & drawing
function renderDonutChart() {
  const chart = document.getElementById('category-donut-chart');
  const legend = document.getElementById('chart-legend');
  chart.innerHTML = '';
  legend.innerHTML = '';

  const categories = [
    { name: 'Transport', value: state.footprint.transport, color: 'var(--cyan)' },
    { name: 'Housing', value: state.footprint.housing, color: 'var(--amber)' },
    { name: 'Diet', value: state.footprint.diet, color: 'var(--emerald)' },
    { name: 'Shopping', value: state.footprint.consumption, color: 'var(--purple)' }
  ];

  const totalVal = categories.reduce((sum, item) => sum + item.value, 0);

  if (totalVal === 0) return;

  let accumulatedPercent = 0;

  categories.forEach(cat => {
    const share = cat.value / totalVal;
    const percent = Math.round(share * 100);
    const strokeDash = percent;
    const strokeOffset = 100 - strokeDash;

    // SVG Circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('class', 'donut-segment');
    circle.setAttribute('cx', '18');
    circle.setAttribute('cy', '18');
    circle.setAttribute('r', '15.91549430918954');
    circle.setAttribute('stroke', cat.color);
    circle.setAttribute('stroke-dasharray', `${strokeDash} ${strokeOffset}`);
    circle.setAttribute('stroke-dashoffset', `${100 - accumulatedPercent}`);
    
    // Title tag for hover description
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `${cat.name}: ${cat.value} Tons (${percent}%)`;
    circle.appendChild(title);

    chart.appendChild(circle);

    accumulatedPercent += percent;

    // Legend builders
    const legendItem = document.createElement('div');
    legendItem.className = 'legend-item';
    legendItem.innerHTML = `
      <div class="d-flex align-items-center">
        <span class="legend-dot" style="background-color: ${cat.color}"></span>
        <span class="text-secondary font-size-xs fw-semibold">${cat.name}</span>
      </div>
      <span class="font-outfit fw-bold text-light">${cat.value.toFixed(1)} T</span>
    `;
    legend.appendChild(legendItem);
  });
}

// Smart Insights Generator
function generateAIInsights() {
  const title = document.getElementById('insight-title');
  const text = document.getElementById('insight-text');
  const actionBtn = document.getElementById('insight-action-btn');

  if (title) title.textContent = 'TerraTrace AI Consultation';
  if (text) {
    text.textContent = 'Our advanced AI assistant evaluates your entire carbon footprint across transport, housing, diet, and lifestyle to formulate a personalized, high-impact emission reduction strategy.';
  }
  if (actionBtn) actionBtn.textContent = 'Start AI Consultation';
}

// Action Hub commitment grid
function renderActionHubGrid() {
  const grid = document.getElementById('actions-grid');
  grid.innerHTML = '';

  // Filter selection
  const activeFilterBtn = document.querySelector('.filter-btn.active');
  const filter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';

  const filtered = REDUCTION_ACTIONS.filter(act => {
    if (filter === 'all') return true;
    return act.category === filter;
  });

  filtered.forEach(action => {
    const isCommitted = state.committedActions.includes(action.id);
    const card = document.createElement('div');
    card.className = `action-card card-hover ${isCommitted ? 'committed' : ''}`;

    card.innerHTML = `
      <div>
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="badge badge-primary">${action.category}</span>
          <span class="font-size-xs text-secondary font-bold">${action.difficulty}</span>
        </div>
        <h4 class="font-outfit fw-bold text-light mb-1">${action.title}</h4>
        <p class="text-secondary font-size-xs leading-relaxed mb-3">${action.desc}</p>
      </div>
      <div>
        <div class="divider opacity-10 mb-3"></div>
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <span class="font-size-xs text-secondary block">Annual Savings</span>
            <span class="font-outfit fw-extrabold text-emerald font-size-md">-${action.savings} kg CO₂e</span>
          </div>
          <button class="btn ${isCommitted ? 'btn-secondary' : 'btn-primary'} py-2 font-size-xs" onclick="toggleCommitAction('${action.id}')">
            ${isCommitted ? 'Release' : 'Commit'}
          </button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

// Global window action toggle helper
window.toggleCommitAction = (actionId) => {
  const idx = state.committedActions.indexOf(actionId);
  const action = REDUCTION_ACTIONS.find(a => a.id === actionId);

  if (idx > -1) {
    state.committedActions.splice(idx, 1);
    showToastNotification(`Released commitment: ${action.title}`);
  } else {
    state.committedActions.push(actionId);
    showToastNotification(`Committed to: ${action.title}! Carbon profile updated.`);
  }

  saveState();
  renderApp();
};

// Category filters hook
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderActionHubGrid();
  });
});

// Logs feed visual builder
function renderActivityLogsFeed() {
  const container = document.getElementById('activity-log-list');
  const emptyIndicator = document.getElementById('empty-logs-indicator');
  
  // Clear previous
  const items = container.querySelectorAll('.activity-item');
  items.forEach(i => i.remove());

  if (state.completedLogs.length === 0) {
    emptyIndicator.classList.remove('d-none');
    return;
  }

  emptyIndicator.classList.add('d-none');

  state.completedLogs.forEach(log => {
    const logItem = document.createElement('div');
    logItem.className = 'activity-item d-flex justify-content-between align-items-center mb-3 p-3 glass-panel-sm rounded-lg';
    
    // icon helper
    let iconSvg = '';
    if (log.category === 'food') {
      iconSvg = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" class="text-emerald" aria-hidden="true"><path d="M12 2v2M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
    } else if (log.category === 'transport') {
      iconSvg = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" class="text-cyan" aria-hidden="true"><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7c0 .6.4 1 1 1h2"/></svg>';
    } else if (log.category === 'energy') {
      iconSvg = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" class="text-amber" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>';
    } else {
      iconSvg = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" class="text-purple" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>';
    }

    logItem.innerHTML = `
      <div class="d-flex align-items-center gap-3">
        <div class="log-item-icon-wrap p-2 glass-panel-sm rounded-full">
          ${iconSvg}
        </div>
        <div>
          <h6 class="font-outfit fw-bold text-light mb-0">${log.label}</h6>
          <span class="text-secondary font-size-xs">${log.timestamp}</span>
        </div>
      </div>
      <div class="text-right d-flex align-items-center gap-2">
        <span class="font-outfit fw-extrabold text-emerald font-size-sm">-${log.savings} kg</span>
        <button class="btn btn-outline-secondary p-1 rounded-full border-none opacity-40 hover-opacity-100" onclick="deleteLogEntry('${log.id}')" title="Delete entry" aria-label="Delete activity log">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    `;

    container.appendChild(logItem);
  });
}

// Global logger entry delete helper
window.deleteLogEntry = (logId) => {
  const idx = state.completedLogs.findIndex(l => l.id === logId);
  if (idx > -1) {
    const deletedLog = state.completedLogs[idx];
    state.completedLogs.splice(idx, 1);
    showToastNotification(`Removed entry: ${deletedLog.label}`);
    saveState();
    renderApp();
  }
};

// Milestone rendering
function renderMilestoneCard(totalSavedKg) {
  const milestoneTitle = document.getElementById('milestone-title');
  const milestoneProgress = document.getElementById('milestone-progress-bar');
  const progressText = document.getElementById('milestone-progress-text');
  const targetText = document.getElementById('milestone-target-text');
  const badgeRank = document.getElementById('eco-rank-badge');

  // Milestone tier limits (kg)
  const milestones = [
    { name: 'Bronze Pioneer', target: 150, rank: 'Green Novice' },
    { name: 'Silver Guardian', target: 500, rank: 'Eco Advocate' },
    { name: 'Gold Protector', target: 1500, rank: 'Earth Guardian' },
    { name: 'Carbon Master', target: 4000, rank: 'Eco Warrior' }
  ];

  let currentTier = milestones[0];
  for (let i = 0; i < milestones.length; i++) {
    if (totalSavedKg >= milestones[i].target) {
      if (i < milestones.length - 1) {
        currentTier = milestones[i + 1];
      } else {
        currentTier = { name: 'Carbon Champion', target: 10000, rank: 'Sustainability Sage' };
      }
    }
  }

  // Set user rank badge based on total savings
  let achievedRank = 'Green Novice';
  if (totalSavedKg >= 4000) achievedRank = 'Sustainability Sage';
  else if (totalSavedKg >= 1500) achievedRank = 'Eco Warrior';
  else if (totalSavedKg >= 500) achievedRank = 'Earth Guardian';
  else if (totalSavedKg >= 150) achievedRank = 'Eco Advocate';

  badgeRank.textContent = achievedRank;

  milestoneTitle.textContent = currentTier.name;
  targetText.textContent = `Goal: ${currentTier.target} kg`;
  
  // Calculate relative progress bar
  const previousTarget = milestones.find((m, idx) => m.name === currentTier.name) 
    ? (milestones[milestones.findIndex(m => m.name === currentTier.name) - 1]?.target || 0) 
    : 4000;
  
  const span = currentTier.target - previousTarget;
  const progress = Math.max(0, Math.min(100, ((totalSavedKg - previousTarget) / span) * 100));

  milestoneProgress.style.width = `${progress}%`;
  progressText.textContent = `${Math.round(totalSavedKg)} / ${currentTier.target} kg CO₂`;
}

// Offset simulator visual builder
function renderOffsetsView(remainingFootprint, totalOffsetsTons, netFootprint) {
  const currentFpText = document.getElementById('offset-current-footprint');
  const purchasedText = document.getElementById('offset-purchased-value');
  const balanceText = document.getElementById('offset-net-balance');

  const sealRing = document.getElementById('seal-ring-anim');
  const sealContent = document.getElementById('seal-content-card');
  const sealTitle = document.getElementById('seal-status-title');
  const sealLockIcon = document.getElementById('seal-lock-icon');
  const sealFooterText = document.getElementById('seal-footer-text');

  currentFpText.textContent = `${remainingFootprint.toFixed(2)} T / yr`;
  purchasedText.textContent = `${totalOffsetsTons.toFixed(2)} T / yr`;
  balanceText.textContent = `${netFootprint.toFixed(2)} T / yr`;

  // Net Zero Check
  if (netFootprint <= 0 && remainingFootprint > 0) {
    // Certified Net Zero!
    sealRing.classList.add('active-spinning');
    sealContent.classList.add('neutral');
    sealTitle.textContent = 'NET-ZERO ACTIVE';
    sealTitle.classList.add('text-emerald');
    sealTitle.classList.remove('text-secondary');
    
    // Change lock icon to checkmark
    sealLockIcon.outerHTML = `<svg id="seal-lock-icon" viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2.5" class="text-emerald mb-1" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>`;
    
    sealFooterText.innerHTML = '<span class="text-emerald fw-bold">Congratulations!</span> You have simulated enough carbon offsets to offset your operational emissions.';
  } else {
    // Pending Offset balance
    sealRing.classList.remove('active-spinning');
    sealContent.classList.remove('neutral');
    sealTitle.textContent = 'BALANCE PENDING';
    sealTitle.classList.remove('text-emerald');
    sealTitle.classList.add('text-secondary');

    // Restore lock icon
    const existingLockIcon = document.getElementById('seal-lock-icon');
    if (existingLockIcon) {
      existingLockIcon.outerHTML = `<svg id="seal-lock-icon" viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2.5" class="text-secondary opacity-40 mb-1" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
    }

    sealFooterText.textContent = 'Offset 100% of your remaining annual footprint to unlock the certified Carbon Neutral status badge.';
  }

  // Populate project grid
  const projectGrid = document.getElementById('offset-projects-grid');
  projectGrid.innerHTML = '';

  OFFSET_PROJECTS.forEach(project => {
    const purchasedValue = state.offsets[project.id] || 0;
    const projectCard = document.createElement('div');
    projectCard.className = 'glass-panel p-4 d-flex flex-column justify-content-between card-hover relative overflow-hidden';
    
    projectCard.innerHTML = `
      <div>
        <div class="d-flex justify-content-between align-items-start mb-3">
          <div class="project-icon-box bg-dark-deep p-2 rounded-lg font-size-lg">${project.imageIcon}</div>
          <div class="text-right">
            <span class="font-outfit fw-bold text-emerald font-size-sm">$${project.costPerTon}</span>
            <span class="text-secondary font-size-xs block">/ ton CO₂e</span>
          </div>
        </div>
        <h4 class="font-outfit fw-bold text-light mb-1">${project.title}</h4>
        <span class="text-cyan font-size-xs block mb-2">${project.location}</span>
        <p class="text-secondary font-size-xs leading-relaxed mb-4">${project.desc}</p>
      </div>
      <div>
        <div class="divider opacity-10 mb-3"></div>
        <div class="d-flex justify-content-between align-items-center mb-2">
          <label for="slider-${project.id}" class="font-size-xs text-secondary">Purchase simulated credits</label>
          <span class="font-outfit fw-extrabold text-cyan font-size-sm" id="label-tons-${project.id}">${purchasedValue.toFixed(1)} Tons</span>
        </div>
        <input type="range" id="slider-${project.id}" class="form-range w-100 offset-slider" data-proj-id="${project.id}" min="0" max="10" step="0.5" value="${purchasedValue}">
        <div class="d-flex justify-content-between font-size-xs text-secondary mt-1">
          <span>0T</span>
          <span>Cost: <strong class="text-light" id="label-cost-${project.id}">$${(purchasedValue * project.costPerTon).toFixed(0)}</strong></span>
          <span>10T</span>
        </div>
      </div>
    `;

    projectGrid.appendChild(projectCard);
  });

  // Slider actions hook
  const offsetSliders = projectGrid.querySelectorAll('.offset-slider');
  offsetSliders.forEach(slider => {
    slider.addEventListener('input', (e) => {
      const projId = e.target.dataset.projId;
      const val = parseFloat(e.target.value);
      state.offsets[projId] = val;
      
      // Update specific DOM labels directly instead of rebuilding entire DOM grid
      const project = OFFSET_PROJECTS.find(p => p.id === projId);
      const tonsLabel = document.getElementById(`label-tons-${projId}`);
      const costLabel = document.getElementById(`label-cost-${projId}`);
      if (tonsLabel) tonsLabel.textContent = `${val.toFixed(1)} Tons`;
      if (costLabel) costLabel.textContent = `$${(val * project.costPerTon).toFixed(0)}`;

      updateOffsetCalculationsOnly();
      saveState();
    });
  });
}

// --- Live Carbon Clock ---
function startLiveCarbonClock() {
  const clockElement = document.getElementById('global-co2-clock');
  if (!clockElement) return;

  const EMISSIONS_PER_SECOND = 1176.4; // 37.1 Billion Tons / year
  
  const updateClock = () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const secondsElapsed = (now.getTime() - startOfDay.getTime()) / 1000;
    
    // Emissions today
    const emissionsToday = secondsElapsed * EMISSIONS_PER_SECOND;
    
    // Display with nice commas and decimals
    clockElement.textContent = emissionsToday.toLocaleString('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });
  };

  updateClock();
  setInterval(updateClock, 100);
}

// --- Daily Logging Streak Calculator ---
function calculateStreak() {
  if (state.completedLogs.length === 0) return 0;

  // Extract unique dates of logs (normalized to midnight)
  const logDates = state.completedLogs.map(log => {
    return new Date(log.rawDate || Date.now()).toDateString();
  });

  const uniqueDates = [...new Set(logDates)];
  
  let streak = 0;
  let checkDate = new Date();
  
  // Normalize checkDate to midnight
  checkDate.setHours(0,0,0,0);

  // If latest log is neither today nor yesterday, streak is 0
  const todayStr = checkDate.toDateString();
  checkDate.setDate(checkDate.getDate() - 1);
  const yesterdayStr = checkDate.toDateString();

  if (!uniqueDates.includes(todayStr) && !uniqueDates.includes(yesterdayStr)) {
    return 0;
  }

  // Count backwards from today
  checkDate = new Date(); // Reset to today
  checkDate.setHours(0,0,0,0);
  
  while (true) {
    const dateStr = checkDate.toDateString();
    if (uniqueDates.includes(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1); // Go back one day
    } else {
      break;
    }
  }

  return streak;
}

// --- AI Insights Modal Controls ---
let typeTimer = null; // Global typewriter tracker

function initAIInsightsModal() {
  const modal = document.getElementById('ai-insights-modal');
  const openBtn = document.getElementById('insight-action-btn');
  const closeBtn = document.getElementById('close-ai-modal-btn');
  
  // Open / Close Modal
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      modal.classList.remove('d-none');
      modal.classList.add('d-flex');
      
      // Reset stages
      document.getElementById('ai-loading-stage').classList.add('d-none');
      document.getElementById('ai-output-stage').classList.add('d-none');
      
      // Automatically trigger secure backend audit
      runAIInsights(false);
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.add('d-none');
      modal.classList.remove('d-flex');
      
      // Stop typing if active
      if (typeTimer) {
        clearInterval(typeTimer);
      }
    });
  }
}

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatMarkdown(text) {
  const escaped = escapeHTML(text || '');
  let formatted = escaped
    .replace(/### (.*?)(?=\n|$)/g, '<h5 class="font-outfit fw-bold text-cyan mt-3 mb-2">$1</h5>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-emerald">$1</strong>')
    .replace(/- (.*?)(?=\n|$)/g, '<li class="ml-4 list-disc font-size-xs text-secondary mb-1">$1</li>')
    .replace(/\* (.*?)(?=\n|$)/g, '<li class="ml-4 list-disc font-size-xs text-secondary mb-1">$1</li>')
    .replace(/\*([^*]+)\*/g, '<em class="text-secondary">$1</em>') // support italics
    .replace(/\n/g, '<br>');
  return formatted;
}

// Run AI consultation logic
async function runAIInsights(isDemo) {
  const loadingStage = document.getElementById('ai-loading-stage');
  const outputStage = document.getElementById('ai-output-stage');
  const reportBody = document.getElementById('ai-report-body');
  const loadingDetail = document.getElementById('ai-loading-detail');
  const modelBadge = document.getElementById('ai-model-badge');

  loadingStage.classList.remove('d-none');
  outputStage.classList.add('d-none');
  reportBody.innerHTML = '';

  const inputs = state.onboardingInputs;
  const footprint = state.footprint;

  // 1. Calculate current saved numbers
  let annualCommittedSavingsKg = 0;
  state.committedActions.forEach(id => {
    const act = REDUCTION_ACTIONS.find(a => a.id === id);
    if (act) annualCommittedSavingsKg += act.savings;
  });
  const committedTons = annualCommittedSavingsKg / 1000;

  let loggedSavingsKg = 0;
  state.completedLogs.forEach(log => {
    loggedSavingsKg += log.savings;
  });

  const totalOffsetsTons = Object.values(state.offsets).reduce((acc, curr) => acc + curr, 0);

  // Visual loading details ticker
  const phrases = [
    'Synthesizing transport mileage and flight patterns...',
    'Reviewing household members and heating fuel energy bills...',
    'Evaluating dietary carbon impact variables...',
    'Cross-referencing committed reduction actions...',
    'Requesting secure audit from backend server...'
  ];
  let phraseIdx = 0;
  loadingDetail.textContent = phrases[0];
  const phraseInterval = setInterval(() => {
    phraseIdx = (phraseIdx + 1) % phrases.length;
    loadingDetail.textContent = phrases[phraseIdx];
  }, 1000);

  let responseText = '';

  if (isDemo) {
    if (modelBadge) modelBadge.textContent = 'Demo Advisory Engine';
    await new Promise(resolve => setTimeout(resolve, 2200));
    
    const maxCat = Math.max(footprint.transport, footprint.housing, footprint.diet, footprint.consumption);
    if (maxCat === footprint.transport) {
      responseText = `### Executive Summary
Your highest emissions come from **Transport & Commuting** (${footprint.transport.toFixed(1)} T CO₂e/yr). Swapping car journeys for train and bicycle commutes will offer your fastest decarbonization route.

### Top 3 Recommended Actions
1. **Optimize Short Commutes**: Swapping just 3 driving days for a bicycle or walking commutes for short runs under 6km prevents **650 kg CO₂e/yr**.
2. **Train and Rail Over Single-Occupant Vehicles**: Taking public transit for long commutes reduces your travel emissions by up to **80% per kilometer**.
3. **Flight consolidation**: Flying produces high amounts of high-altitude emissions. Saving 2 flight hours/year prevents **180 kg CO₂e**.

### Sign-off
*Every kilometer cycled is a step toward a green future. Keep up the amazing work!*`;
    } else if (maxCat === footprint.housing) {
      responseText = `### Executive Summary
Your highest carbon source is **Household Utilities** (${footprint.housing.toFixed(1)} T CO₂e/yr). Heating and electric bills contribute significantly to grids worldwide.

### Top 3 Recommended Actions
1. **Transition to 100% Renewable Electricity**: Setting your electricity supply to standard renewable plans completely deletes your household electrical footprint!
2. **Thermostat Eco Modes**: Dialing down heating by 2°C in winter and raising summer AC cooling by 2°C prevents **280 kg CO₂e/yr**.
3. **Switch to LED Bulbs**: Replacing your old lightbulbs with energy-efficient LEDs saves **150 kg CO₂e/yr** easily.

### Sign-off
*A carbon-efficient home protects the canopy of the world. Great steps!*`;
    } else if (maxCat === footprint.diet) {
      responseText = `### Executive Summary
Your **Dietary Choices** (${footprint.diet.toFixed(1)} T CO₂e/yr) represent your largest source of carbon. Red meat and livestock farming generate methane and land canopy loss.

### Top 3 Recommended Actions
1. **Introduce Meatless Mondays**: Committing to plant-based meals one day/week offsets beef emissions and reduces your food footprint by **320 kg CO₂e/yr**.
2. **Shift to Low-Carbon Proteins**: Swapping beef and lamb for chicken, fish, and legumes reduces agricultural land use by up to **90%**.
3. **Local Organic Produce**: Boycotting out-of-season air-freighted items reduces transport-related retail emissions by **1.6 kg CO₂e** per meal.

### Sign-off
*Sustaining our tables with plant foods is one of the most powerful things you can do for Earth.*`;
    } else {
      responseText = `### Executive Summary
Your **Lifestyle & Buying Habits** (${footprint.consumption.toFixed(1)} T CO₂e/yr) are your main footprint source. Manufacturing new tech, clothes, and appliances generates heavy factory emissions.

### Top 3 Recommended Actions
1. **Prioritize Secondhand Goods**: Shifting to pre-owned clothes, electronics, and books reduces supply-chain emissions by **4.8 kg CO₂e** per item.
2. **Recycle and Compost Everything**: Maximizing household recycling and composting organic waste prevents **130 kg CO₂e/yr**.
3. **Boycott Single-use Plastics**: Swapping packaging for reusable bags, steel water flasks, and storage jars prevents **1.1 kg CO₂e** daily.

### Sign-off
*Reducing what we buy is the ultimate form of environmental stewardship!*`;
    }
  } else {
    if (modelBadge) modelBadge.textContent = 'Gemini 1.5 Flash (Backend)';
    
    try {
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          footprint,
          inputs,
          loggedSavingsKg,
          totalOffsetsTons
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Server returned error status.' }));
        throw new Error(errData.error || `HTTP Code ${response.status}`);
      }

      const data = await response.json();
      responseText = data.text;
    } catch (err) {
      console.error(err);
      clearInterval(phraseInterval);
      
      // Fallback to Demo mode automatically on error so the user has immediate diagnostic support
      if (modelBadge) modelBadge.textContent = 'Demo Advisory Engine (Fallback)';
      showToastNotification(`Backend Error: ${err.message}. Running Demo Diagnostic...`);
      
      // Run the demo engine on fallback
      runAIInsights(true);
      return;
    }
  }

  clearInterval(phraseInterval);
  loadingStage.classList.add('d-none');
  outputStage.classList.remove('d-none');

  const formattedHtml = formatMarkdown(responseText + '\n');
  
  let i = 0;
  reportBody.innerHTML = '';
  
  if (typeTimer) {
    clearInterval(typeTimer);
  }
  
  typeTimer = setInterval(() => {
    if (i < formattedHtml.length) {
      // Skip tags in a loop so multiple consecutive tags (e.g. </strong><br>) are parsed instantly
      while (i < formattedHtml.length && formattedHtml[i] === '<') {
        const nextChar = formattedHtml[i + 1];
        if (nextChar && /[a-zA-Z/]/.test(nextChar)) {
          const closingIdx = formattedHtml.indexOf('>', i);
          if (closingIdx !== -1) {
            i = closingIdx + 1;
          } else {
            break;
          }
        } else {
          break;
        }
      }
      
      // Advance by one character to type it out
      if (i < formattedHtml.length) {
        i++;
      }
      
      // Render the complete sub-string so the browser's parser correctly encapsulates text inside tags
      reportBody.innerHTML = formattedHtml.substring(0, i);
      
      if (i % 5 === 0) {
        const parent = document.querySelector('.ai-output-container');
        if (parent) {
          parent.scrollTop = parent.scrollHeight;
        }
      }
    } else {
      clearInterval(typeTimer);
      const parent = document.querySelector('.ai-output-container');
      if (parent) {
        parent.scrollTop = parent.scrollHeight;
      }
    }
  }, 20);
}

// Helper functions for lightweight DOM updates
function updateProjectionImpactOnly() {
  let annualCommittedSavingsKg = 0;
  state.committedActions.forEach(id => {
    const act = REDUCTION_ACTIONS.find(a => a.id === id);
    if (act) annualCommittedSavingsKg += act.savings;
  });

  let loggedSavingsKg = 0;
  state.completedLogs.forEach(log => {
    loggedSavingsKg += log.savings;
  });

  const committedTons = annualCommittedSavingsKg / 1000;
  const projectionYears = state.projectionYears || 5;
  const totalAnnualSavingsKg = loggedSavingsKg + (committedTons * 1000);
  const projectedSavingsKg = totalAnnualSavingsKg * projectionYears;
  
  const treeCount = Math.floor(projectedSavingsKg / 22);
  const flightEquivalent = (projectedSavingsKg / 90).toFixed(1);
  
  let equivText = '';
  if (projectedSavingsKg === 0) {
    equivText = `Log activities or commit to challenges to project your forest growth over <strong>${projectionYears} years</strong>. 🌲`;
  } else {
    equivText = `Over <strong>${projectionYears} years</strong>, your actions will prevent <strong>${Math.round(projectedSavingsKg)} kg CO₂e</strong>, equivalent to growing <strong>${treeCount} mature trees</strong>, or skipping <strong>${flightEquivalent} hours</strong> of flight time. 🌲`;
  }
  
  const equivalencyTextEl = document.getElementById('equivalency-text');
  if (equivalencyTextEl) {
    equivalencyTextEl.innerHTML = equivText;
  }

  const visualizerContainer = document.getElementById('impact-visualizer');
  if (visualizerContainer) {
    visualizerContainer.innerHTML = '';
    visualizerContainer.className = 'w-100 mt-2 d-flex flex-column gap-2 text-secondary font-size-xs';

    if (projectedSavingsKg > 0) {
      const trees = treeCount;
      const flights = flightEquivalent;
      const homes = Math.round(projectedSavingsKg / 8.5);
      
      visualizerContainer.innerHTML = `
        <div class="d-flex justify-content-between border-bottom pb-1 opacity-80" style="border-color: rgba(255, 255, 255, 0.08) !important;">
          <span>Forestry Equivalent:</span>
          <span class="text-emerald fw-bold">${trees} mature trees</span>
        </div>
        <div class="d-flex justify-content-between border-bottom pb-1 opacity-80" style="border-color: rgba(255, 255, 255, 0.08) !important;">
          <span>Aviation Offset:</span>
          <span class="text-cyan fw-bold">${flights} flight hours</span>
        </div>
        <div class="d-flex justify-content-between pb-1 opacity-80">
          <span>Household Power Saved:</span>
          <span class="text-amber fw-bold">${homes} days electricity</span>
        </div>
      `;
    } else {
      visualizerContainer.innerHTML = `
        <div class="text-center py-4 opacity-60 font-size-xs font-jakarta">
          Log activities or commit to challenges to project your utility and forestry equivalents over time.
        </div>
      `;
    }
  }
}

function updateOffsetCalculationsOnly() {
  let annualCommittedSavingsKg = 0;
  state.committedActions.forEach(id => {
    const act = REDUCTION_ACTIONS.find(a => a.id === id);
    if (act) annualCommittedSavingsKg += act.savings;
  });

  const rawFootprint = state.footprint.total;
  const committedTons = annualCommittedSavingsKg / 1000;
  const remainingFootprint = Math.max(0, rawFootprint - committedTons);
  const totalOffsetsTons = Object.values(state.offsets).reduce((acc, curr) => acc + curr, 0);
  const netFootprint = Math.max(0, remainingFootprint - totalOffsetsTons);

  const purchasedText = document.getElementById('offset-purchased-value');
  const balanceText = document.getElementById('offset-net-balance');
  if (purchasedText) purchasedText.textContent = `${totalOffsetsTons.toFixed(2)} T / yr`;
  if (balanceText) balanceText.textContent = `${netFootprint.toFixed(2)} T / yr`;

  const sealRing = document.getElementById('seal-ring-anim');
  const sealContent = document.getElementById('seal-content-card');
  const sealTitle = document.getElementById('seal-status-title');
  const sealLockIcon = document.getElementById('seal-lock-icon');
  const sealFooterText = document.getElementById('seal-footer-text');

  if (netFootprint <= 0 && remainingFootprint > 0) {
    if (sealRing) sealRing.classList.add('active-spinning');
    if (sealContent) sealContent.classList.add('neutral');
    if (sealTitle) {
      sealTitle.textContent = 'NET-ZERO ACTIVE';
      sealTitle.classList.add('text-emerald');
      sealTitle.classList.remove('text-secondary');
    }
    if (sealLockIcon) {
      sealLockIcon.outerHTML = `<svg id="seal-lock-icon" viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2.5" class="text-emerald mb-1" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>`;
    }
    if (sealFooterText) {
      sealFooterText.innerHTML = '<span class="text-emerald fw-bold">Congratulations!</span> You have simulated enough carbon offsets to offset your operational emissions.';
    }
  } else {
    if (sealRing) sealRing.classList.remove('active-spinning');
    if (sealContent) sealContent.classList.remove('neutral');
    if (sealTitle) {
      sealTitle.textContent = 'BALANCE PENDING';
      sealTitle.classList.remove('text-emerald');
      sealTitle.classList.add('text-secondary');
    }
    if (sealLockIcon) {
      sealLockIcon.outerHTML = `<svg id="seal-lock-icon" viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2.5" class="text-secondary opacity-40 mb-1" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
    }
    if (sealFooterText) {
      sealFooterText.textContent = 'Offset 100% of your remaining annual footprint to unlock the certified Carbon Neutral status badge.';
    }
  }
}

// Exports for unit testing
export { calculateCarbonFootprint, calculateStreak, formatMarkdown, escapeHTML, updateProjectionImpactOnly, updateOffsetCalculationsOnly, state };
