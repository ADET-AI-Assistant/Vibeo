# 🎬 Vibeo — AI Mood-Matching & 10-Foot TV Streaming Platform

<div align="center">

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Django](https://img.shields.io/badge/Django-5.2%20REST-092E20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Google-Gemini%20AI-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Tests](https://img.shields.io/badge/Vitest-23%2F23%20Passing-449C44?logo=vitest&logoColor=white)](https://vitest.dev/)

**Vibeo** is a next-generation personal streaming and discovery platform. It combines cinematic content browsing, Google Gemini AI mood-matching, and a dedicated **10-Foot TV Mode** designed for Smart TVs, gamepads, and remote controls.

[🍿 User Guide](#-user-guide) • [📺 TV Mode Guide](#-10-foot-tv-mode-guide) • [💻 Developer Guide](#-developer-guide) • [🧪 Running Tests](#-testing)

</div>

---

## 📑 Table of Contents

- [🍿 User Guide](#-user-guide)
  - [Discover & Mood Mixer](#-discover--mood-mixer)
  - [Vibey — Your AI Cinema Assistant](#-vibey--your-ai-cinema-assistant)
  - [Taste Matcher & Smart Search](#-taste-matcher--smart-search)
  - [Personal Library, Streaks & Leaderboard](#-personal-library-streaks--leaderboard)
- [📺 10-Foot TV Mode Guide](#-10-foot-tv-mode-guide)
  - [How to Launch TV Mode](#how-to-launch-tv-mode)
  - [Remote & Controller Cheatsheet](#remote--controller-cheatsheet)
  - [On-Screen Virtual Keyboard](#on-screen-virtual-keyboard)
- [💻 Developer Guide](#-developer-guide)
  - [Architecture Overview](#architecture-overview)
  - [Prerequisites](#prerequisites)
  - [One-Command Quick Start](#one-command-quick-start)
  - [Environment Configuration](#environment-configuration)
  - [Available NPM Scripts](#available-npm-scripts)
  - [Directory Structure](#directory-structure)
- [🧪 Testing](#-testing)
- [🤝 Contributing & License](#-contributing)

---

# 🍿 User Guide

Welcome to Vibeo! Whether you're watching on your laptop, mobile phone, or relaxing on the couch in front of your Smart TV, Vibeo is built to make finding and watching great films effortless.

### 🎭 Discover & Mood Mixer
- **Mood Pills**: Tap on how you're feeling (*"Exciting"*, *"Relaxing"*, *"Dark"*, *"Romantic"*, *"Inspiring"*) and Vibeo instantly reshuffles recommendations to match your emotional wavelength.
- **Dynamic Spotlights & Rows**: Explore trending weekly hits, top-rated classics, upcoming theatrical releases, and genre collections powered by TMDB.

### 🤖 Vibey — Your AI Cinema Assistant
- Click the floating **Vibey** icon in the bottom-right corner anytime to chat with an AI cinephile.
- Ask questions like:
  - *"I want a mind-bending sci-fi thriller like Inception but with darker psychological themes."*
  - *"Recommend a lighthearted comedy from the 90s for a cozy movie night."*
- Vibey analyzes movie themes, directors, and plotlines using Google Gemini AI to find precise matches.

### 🎯 Taste Matcher & Smart Search
- **Taste Matcher**: Input two or three movies you love, and Vibeo will synthesize their DNA to recommend hidden gems that bridge them.
- **Smart Search**: Search by actors, natural language vibes (*"movies with neon aesthetic and synthwave soundtrack"*), directors, or keywords with instant live suggestions.

### 📑 Personal Library, Streaks & Leaderboard
- **Watchlist & Favorites**: Save movies with one click. Works for guests via local storage, or across devices when logged into your account.
- **Watch Streaks**: Keep your streak alive by logging in and watching daily.
- **Global Leaderboard**: Compete with other cinephiles on total watch time and daily streak rankings.

---

# 📺 10-Foot TV Mode Guide

Vibeo includes a custom-engineered **10-Foot Lean-Back Interface** designed specifically for Smart TVs, Android TV boxes, game consoles, and living room PCs.

### How to Launch TV Mode
- **From Desktop**: Click the **TV Mode 📺** button in the top navigation bar, or go to **Settings → Layout → Launch TV Mode**.
- **Direct URL**: Navigate to `http://localhost:5173/tv` in your browser.
- **Automatic Smart TV Detection**: If you open Vibeo on a Samsung Tizen TV, LG webOS, Android TV, or Apple TV browser, Vibeo automatically detects your device and switches to TV Mode.

### Remote & Controller Cheatsheet

| Action | Smart TV Remote (Tizen / webOS / Android TV) | Keyboard | Gamepad (Xbox / PlayStation / 8BitDo) |
| :--- | :--- | :--- | :--- |
| **Navigate** | D-Pad (`Up` / `Down` / `Left` / `Right`) | Arrow Keys | D-Pad or Left Analog Stick |
| **Open Left Sidebar** | Press `Left` on the first card of any row | `Left Arrow` | D-Pad Left |
| **Select / Play** | `Enter` / `OK` / `Center` | `Enter` / `Space` | Button `A` (Xbox) / `✕` (PS) |
| **Back / Exit Screen**| `Return` / `Back` (keycodes 10009 / 461 / 4) | `Escape` / `Backspace` | Button `B` (Xbox) / `○` (PS) |
| **Player Seek -10s / +10s**| `Left` / `Right` arrows during playback | `Left` / `Right` | D-Pad Left / Right |
| **Player Play / Pause** | `Play` / `Pause` / `OK` | `Space` / `Enter` | Button `A` / Button `X` |

### On-Screen Virtual Keyboard
- In **TV Search (`/tv/search`)**, an on-screen 2D grid keyboard allows you to type search terms using only the remote's arrow keys.
- **Voice Search**: Select the microphone icon on compatible browsers to search via speech-to-text.

---

# 💻 Developer Guide

### Architecture Overview

Vibeo is structured as a modern hybrid application:
1. **Frontend (Vite + React 19)**: Fast client application with Tailwind CSS v4, Lucide icons, and TanStack Query.
2. **Spatial Navigation Engine (`src/tv/`)**: Zero-dependency 4-way D-Pad focus manager with zone memory and Web Audio API synthesizer.
3. **Backend API (Django 5.2 + Django REST Framework)**: Manages global leaderboard rankings, streak validation, and relational synchronization.
4. **Cloud BaaS (Firebase)**: Handles user authentication (Google Auth / Email) and real-time Firestore database.
5. **AI Inference**: Google Gemini 1.5 Flash for conversational movie recommendations.

```
📦 Vibeo
 ┣ 📂 backend/           # Django REST API (leaderboard, stats sync, SQLite/PostgreSQL)
 ┣ 📂 src/
 ┃ ┣ 📂 api/             # TMDB, Gemini AI, and Django API clients
 ┃ ┣ 📂 components/      # Reusable UI components (Header, Footer, ErrorToast)
 ┃ ┣ 📂 context/         # React Contexts (Auth, Layout, UserMovies)
 ┃ ┣ 📂 hooks/           # Custom hooks (useHomePageData, useMovieDetail)
 ┃ ┣ 📂 pages/           # Desktop pages (Dashboard, Watch, Play, Library, etc.)
 ┃ ┣ 📂 tv/              # 10-Foot TV Mode implementation
 ┃ ┃ ┣ 📂 components/    # TVSidebar, TVMovieRow, TVHeroBanner, TVVirtualKeyboard
 ┃ ┃ ┣ 📂 context/       # TVFocusContext (Spatial Navigation Engine)
 ┃ ┃ ┣ 📂 hooks/         # useGamepad controller listener
 ┃ ┃ ┣ 📂 pages/         # TVDashboard, TVWatch, TVPlay, TVSearch, TVLibrary
 ┃ ┃ ┣ 📂 utils/         # remoteKeyMapper (Tizen/webOS/Android TV) & tvAudio
 ┃ ┃ ┗ 📂 __tests__/     # Vitest unit & integration test suites
 ┃ ┣ 📜 App.jsx          # Root routing & Smart TV auto-detection
 ┃ ┗ 📜 main.jsx         # React DOM entry point
 ┣ 📜 package.json       # NPM scripts & dependencies
 ┣ 📜 run_server.js      # Cross-platform Python venv auto-detecting backend runner
 ┣ 📜 vite.config.js     # Vite configuration
 ┗ 📜 vitest.config.js   # Vitest unit testing configuration
```

---

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **Python**: v3.10 or higher ([Download Python](https://www.python.org/))
- **Git**

---

### One-Command Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ADET-AI-Assistant/Vibeo.git
   cd Vibeo
   ```

2. **Run the automated setup:**
   ```bash
   npm run setup
   ```
   *(This automatically installs Node packages, sets up Python backend requirements, and applies database migrations).*

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   - **Frontend**: [http://localhost:5173](http://localhost:5173)
   - **TV Mode**: [http://localhost:5173/tv](http://localhost:5173/tv)
   - **Backend API**: [http://localhost:8000/api/](http://localhost:8000/api/)

---

### Environment Configuration

Create a `.env` file in the root directory:

```env
# TMDB API (Required for movie data)
VITE_TMDB_API_KEY=your_tmdb_api_key_here
VITE_FANART_API_KEY=your_fanart_api_key_here

# Firebase Configuration (Authentication & Cloud Sync)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Gemini AI (Vibey Chatbot & Recommendations)
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GEMINI_MODEL=gemini-1.5-flash
```

> **Note**: Guest mode for Watchlist and TV navigation works immediately even without Firebase credentials!

---

### Available NPM Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts **both** the Django backend (`:8000`) and Vite frontend (`:5173`) concurrently. |
| `npm run setup` | Installs npm dependencies, Python requirements, and runs database migrations. |
| `npm run client` | Starts only the Vite frontend dev server. |
| `npm run server` | Starts only the Django REST API server via `run_server.js`. |
| `npm run backend:migrate` | Applies pending Django database migrations. |
| `npm test` | Runs the automated Vitest test suite. |
| `npm run test:watch` | Runs Vitest in interactive watch mode. |
| `npm run build` | Builds the production bundle with Vite. |

---

# 🧪 Testing

Vibeo maintains an automated test suite powered by **Vitest**, **@testing-library/react**, and **jsdom**.

To run the complete test suite:
```bash
npm test
```

### What is Tested:
- **`remoteKeyMapper.test.js`**: Keycode normalization for Samsung Tizen, LG webOS, Android TV, keyboards, and color keys.
- **`spatialNavigation.test.jsx`**: 4-way D-Pad navigation, boundary trapping, carousel row-to-sidebar transitions, and select actions.
- **`TVVirtualKeyboard.test.jsx`**: Remote keyboard grid traversal, character typing, backspace, and clear.
- **`TVPlayerOSD.test.jsx`**: Player HUD controls, seek feedback badges (-10s / +10s), and play/pause toggles.
- **`TVWatchlist.test.jsx`**: Guest persistence with `localStorage`, hero watchlist state toggles, and TV Library carousel population.

---

# 🤝 Contributing

We welcome contributions from the community!

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/CoolFeature`).
3. Commit your Changes (`git commit -m 'feat: add CoolFeature'`).
4. Push to the Branch (`git push origin feature/CoolFeature`).
5. Open a Pull Request.

---

### 📜 License
Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
  <sub>Built with ❤️ for cinephiles, desktop users, and couch streamers everywhere.</sub>
</div>
