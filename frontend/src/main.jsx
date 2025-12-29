import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Suppress development console messages (optional - only in development)
if (import.meta.env.DEV) {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    // Suppress Stripe HTTP warning in development
    if (args[0]?.includes?.('Stripe.js') && args[0]?.includes?.('HTTP')) {
      return;
    }
    originalWarn(...args);
  };

  const originalInfo = console.info;
  console.info = (...args) => {
    // Suppress React DevTools suggestion
    if (args[0]?.includes?.('React DevTools')) {
      return;
    }
    originalInfo(...args);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
