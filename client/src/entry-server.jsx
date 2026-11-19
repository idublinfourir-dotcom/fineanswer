/* eslint-disable react-refresh/only-export-components -- build-time entry, never hot-reloaded */
// Build-time renderer for the public pages (see scripts/prerender.js). Not shipped to browsers.
import { prerender } from "react-dom/static";
import { StaticRouter } from "react-router-dom";
import { AppContent } from "./App";
import { AuthContext } from "./pages/Provider/AuthContext";

export { PAGES, pageSeo, headTags } from "./seo";

// The values ContextProvider starts with in the browser, so the HTML hydrates cleanly.
const signedOut = { user: null, isAdmin: false, loading: true };

export async function render(url) {
  const { prelude } = await prerender(
    <AuthContext.Provider value={signedOut}>
      <StaticRouter location={url}>
        <AppContent />
      </StaticRouter>
    </AuthContext.Provider>,
  );
  return new Response(prelude).text();
}
