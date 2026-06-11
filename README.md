# 🌍 TerraTrace — Premium Carbon Footprint Tracker

**Live Application**: [carbon-footprint-gceh.onrender.com](https://carbon-footprint-gceh.onrender.com/)

TerraTrace is a high-fidelity, single-page web application designed to help individuals calculate, track, and offset their operational carbon footprint. Featuring beautiful glassmorphic widgets, a real-time global carbon clock, gamified habit logs, and personalized AI carbon audits powered by Google Gemini, TerraTrace is a premium carbon companion.

---

## 🚀 Key Features

*   **Interactive Onboarding Wizard**: A multi-step questionnaire that calculates carbon footprint scores across Travel, Housing, Diet, and Consumption.
*   **Real-Time Global Carbon Clock**: A live ticking carbon counter in the header displaying global carbon emissions generated today.
*   **Dynamic Country Comparator**: Compare your carbon score against global averages (USA, India, Brazil, UK, etc.) with custom color coding and a dynamic circular gauge indicator.
*   **Eco-Impact Projection Simulator**: Project carbon savings over 1 to 25 years with badge indicators for tree-planting equivalents, flights skipped, and electricity saved.
*   **Daily Activity Logger & Streak Tracker**: Log daily eco-friendly habits to build consecutive carbon-saving streaks.
*   **Secure AI Carbon Consultant**: Request personalized recommendations from an AI assistant, utilizing a secure Express proxy backend integrating Google Gemini models.

---

## 🛠️ Technology Stack

*   **Frontend**: HTML5, Vanilla JavaScript, CSS3 (Glassmorphic cards & animations), Vite.
*   **Backend**: Node.js, Express.js.
*   **AI Integration**: Google Gemini API via secure server-side fetching.
*   **Security & Protection**: Helmet (secure HTTP headers), express-rate-limit (anti-DoS/abuse), CORS origin constraints, parameter type validation and regex sanitization.
*   **Testing Framework**: Vitest, Supertest, JSDOM.

---

## 📦 Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   NPM
*   Google Gemini API Key (obtained from [Google AI Studio](https://aistudio.google.com/))

### Installation & Setup

1.  Clone or download the project files.
2.  Open a terminal in the project root directory and install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root directory and configure your Port and API Key:
    ```text
    PORT=3001
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```

### Running the App

To run both the Express backend server and frontend development server concurrently:
```bash
npm run dev
```
The app will be available locally at `http://localhost:3000`.

### Running Tests

To execute the automated unit and integration test suites:
```bash
npm run test
```
This runs Vitest to verify calculation accuracy, daily streak counters, and Express endpoint validators.

### Production Build

To compile and minify the frontend assets for deployment:
```bash
npm run build
```
Vite will output the optimized build into the `dist/` directory.
