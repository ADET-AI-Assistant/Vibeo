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

import { ThemeProvider } from './context/ThemeContext';
import App from './App';

// Global styles – Tailwind CSS + custom design tokens
import './styles/index.css';

// React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
