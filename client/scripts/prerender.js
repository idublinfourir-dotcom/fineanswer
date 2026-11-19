// Runs after `vite build`: writes real HTML for each public page so crawlers and
// link previews that don't run JavaScript still see the content and the right tags.
// dist/index.html becomes the rendered homepage; the empty app shell moves to
// dist/spa.html, which vercel.json serves for every other route.
import fs from "node:fs";

// React's production build, as in the browser bundle. Set here, not in package.json,
// so `npm run build` also works in Windows shells.
process.env.NODE_ENV = "production";
const { PAGES, headTags, pageSeo, render } = await import("../dist-server/entry-server.js");

const dist = new URL("../dist/", import.meta.url);
const shell = fs.readFileSync(new URL("index.html", dist), "utf8");
const SEO_BLOCK = /<!--seo-->[\s\S]*?<!--\/seo-->/;
if (!SEO_BLOCK.test(shell) || !shell.includes('<div id="root"></div>')) {
  throw new Error("prerender: index.html is missing the <!--seo--> block or the empty #root");
}
fs.writeFileSync(new URL("spa.html", dist), shell);

for (const path of Object.keys(PAGES)) {
  const body = await render(path);
  const html = shell
    .replace(SEO_BLOCK, () => headTags(pageSeo(path)))
    .replace('<div id="root"></div>', () => `<div id="root">${body}</div>`);

  // Fail the build rather than ship a blank or untagged page.
  const text = body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length < 100) throw new Error(`prerender ${path}: only ${text.length} chars of text rendered`);
  if (!html.includes(`<link data-seo rel="canonical" href="https://www.fineanswer.net${path}">`)) {
    throw new Error(`prerender ${path}: canonical tag missing`);
  }

  const file = path === "/" ? "index.html" : `${path.slice(1)}.html`;
  fs.writeFileSync(new URL(file, dist), html);
  console.log(`prerendered ${path} -> dist/${file} (${text.length} chars of text)`);
}
