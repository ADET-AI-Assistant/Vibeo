# Vibeo: AI Movie Mood-Matching & Streaming

**Vibeo** is a next-generation personal movie streaming and AI-powered mood-matching recommendation platform. Designed with a premium aesthetic and powered by advanced content-based filtering along with Google's Gemini AI, Vibeo intuitively helps you discover what to watch based precisely on your current mood. 

## ✨ Features

- **🎭 AI Mood-Matching**: Describe how you're feeling, and Vibeo's integrated Gemini AI will recommend the perfect movies for your current vibe.
- **🎬 Extensive Discovery Dashboard**: Browse curated selections, trending movies, and personalized recommendations powered by the TMDB API.
- **▶️ Seamless Streaming**: Built-in player for an uninterrupted viewing experience.
- **🔐 Secure Authentication**: Fast and secure Google Sign-In and email authentication powered by Firebase.
- **👤 Personalized Profiles**: Save your favorite movies, manage your watch history, and customize your preferences.
- **📱 Premium Responsive UI**: A visually stunning, modern interface featuring Glassmorphism design principles, smooth animations, and optimized for all devices.

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State/Data Fetching**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **Backend/BaaS**: [Firebase](https://firebase.google.com/) (Authentication, Firestore, Analytics)
- **AI Integration**: [Google Generative AI](https://ai.google.dev/) (Gemini)
- **Movie Data Base**: [TMDB API](https://developer.themoviedb.org/docs)

## 📁 Project Structure

```text
📦 Vibeo
 ┣ 📂 public/          # Static assets (Favicons, etc.)
 ┣ 📂 src/             # Application source code
 ┃ ┣ 📂 api/           # External API clients (TMDB, Gemini)
 ┃ ┣ 📂 assets/        # Internal images, icons, and fonts
 ┃ ┣ 📂 components/    # Reusable UI components
 ┃ ┣ 📂 config/        # App configuration files
 ┃ ┣ 📂 context/       # React Context providers (Auth, Theme, etc.)
 ┃ ┣ 📂 data/          # Static data or mock data
 ┃ ┣ 📂 hooks/         # Custom React hooks
 ┃ ┣ 📂 pages/         # Page components (Dashboard, Watch, Play, etc.)
 ┃ ┣ 📂 styles/        # Global CSS and Tailwind definitions
 ┃ ┣ 📂 utils/         # Helper functions and utilities
 ┃ ┣ 📜 App.jsx        # Main routing component
 ┃ ┣ 📜 firebase.js    # Firebase initialization
 ┃ ┗ 📜 main.jsx       # React application entry point
 ┣ 📜 eslint.config.js # ESLint configuration
 ┣ 📜 index.html       # HTML entry point (SEO optimized)
 ┣ 📜 package.json     # Dependencies & scripts
 ┣ 📜 vite.config.js   # Vite configuration
 ┗ 📜 README.md        # Project documentation
```

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- API Keys for TMDB, Firebase, and Google Gemini AI

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/vibeo.git
   cd vibeo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add the following keys. Make sure to replace the placeholder values with your actual API credentials.
   ```env
   # API Keys
   VITE_TMDB_API_KEY=your_tmdb_api_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   
   # Firebase Config
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

### Building for Production

To create an optimized production build, run:
```bash
npm run build
```

To preview the production build locally, run:
```bash
npm run preview
```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

*Powered by React, AI, and a passion for great cinema.*
