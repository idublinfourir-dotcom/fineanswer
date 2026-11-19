// Runs on every Vercel Analytics event before it leaves the browser.
// Query strings can carry personal data (the reset link has ?email=...), so
// keep only utm_* (Vercel reads those for its campaign reports) and drop the rest.
export function redactUrl(event) {
  try {
    const url = new URL(event.url);
    for (const key of [...url.searchParams.keys()]) {
      if (!key.startsWith("utm_")) url.searchParams.delete(key);
    }
    url.hash = "";
    return { ...event, url: url.toString() };
  } catch {
    return null; // unparseable URL: drop the event rather than send it unredacted
  }
}
