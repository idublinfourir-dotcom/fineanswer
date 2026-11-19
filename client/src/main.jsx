import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import ContextProvider from './pages/Provider/ContextProvider.jsx'

// After a deploy, a tab opened earlier asks for page chunks that no longer exist.
// Reload once to pick up the new build (the time check prevents a reload loop).
window.addEventListener('vite:preloadError', () => {
  try {
    if (Date.now() - Number(sessionStorage.getItem('chunkReloadAt')) < 10000) return
    sessionStorage.setItem('chunkReloadAt', String(Date.now()))
  } catch {
    return // storage blocked: can't guard against a loop, so don't reload
  }
  window.location.reload()
})

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <ContextProvider>
      <App />
    </ContextProvider>
  </StrictMode>
)
// Public pages arrive pre-rendered (scripts/prerender.js): attach to that HTML instead of redrawing it.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
