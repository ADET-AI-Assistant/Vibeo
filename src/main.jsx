/**
 * main.jsx  ─ Application Entry Point
 * ───────────────────────────────────────────────────────────
 * Mounts the React application into the #root DOM element.
 * Wraps the app in:
 *   - <React.StrictMode>  ─ highlights potential issues in dev
 *   - <BrowserRouter>     ─ provides HTML5 history routing
 * ───────────────────────────────────────────────────────────
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';

// Global styles – Tailwind CSS + custom design tokens
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/*
      BrowserRouter provides the routing context for the entire app.
      All <Routes> and <Route> components must be inside BrowserRouter.
    */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
