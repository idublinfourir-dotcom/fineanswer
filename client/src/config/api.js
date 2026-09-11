/**
 * API Configuration
 *
 * LOCAL DEV  → http://localhost:5000  (automatic, no config needed)
 * PRODUCTION → set VITE_API_URL in your Vercel / Netlify environment variables
 *              to the URL of your deployed backend server
 *              e.g.  https://fine-answer-api.up.railway.app
 *
 * ⚠️  Do NOT set this to the frontend URL — it must point to the Express server.
 */
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim()) {
    const url = envUrl.trim();
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url.replace(/\/$/, "");
    }
    return `https://${url}`.replace(/\/$/, "");
  }
  // Development default — no fallback for production to avoid silent mis-routing
  return "http://localhost:5000";
};
export const API_BASE = getApiBaseUrl();
export const API_BASE_URL = `${API_BASE}/api`;
