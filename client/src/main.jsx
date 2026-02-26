import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import { initPostHog } from './posthog'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'

// Initialize analytics (no-op if VITE_POSTHOG_KEY not set)
initPostHog()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
