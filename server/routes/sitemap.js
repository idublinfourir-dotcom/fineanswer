// GET /sitemap.xml: public pages plus every blog post, success story and job.
// www.fineanswer.net/sitemap.xml is proxied here (client/vercel.json).
const express = require("express");
const { collections } = require("../config/db");
const { asyncHandler } = require("../middleware/auth");

const SITE = "https://www.fineanswer.net";
// Keep in step with PAGES in client/src/seo.js.
const STATIC_PAGES = ["/", "/ireland", "/uk", "/australia", "/blog", "/career", "/read-more-info"];

// Same rule as slugify in client/src/seo.js. If they ever drift, the blog page
// still finds the post by its id and redirects to its own address.
const slugify = (s) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 80)
    .replace(/^-+|-+$/g, "");

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const lastmod = (doc) => {
  const d = new Date(doc.updatedAt || doc.createdAt);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

function sitemapXml({ blogs, stories, jobs }) {
  const urls = [
    ...STATIC_PAGES.map((loc) => ({ loc })),
    ...blogs.map((b) => ({
      loc: `/blog/${[slugify(b.title), b._id].filter(Boolean).join("-")}`,
      lastmod: lastmod(b),
    })),
    ...stories.map((s) => ({ loc: `/success-story/${s._id}`, lastmod: lastmod(s) })),
    ...jobs.map((j) => ({ loc: `/jobs/${j._id}`, lastmod: lastmod(j) })),
  ];
  const rows = urls.map(
    ({ loc, lastmod: mod }) =>
      `  <url><loc>${esc(SITE + loc)}</loc>${mod ? `<lastmod>${mod}</lastmod>` : ""}</url>`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows.join("\n")}
</urlset>
`;
}

const sitemapRouter = express.Router();
// Only the fields the sitemap needs, never post bodies or personal details.
const FIELDS = { projection: { title: 1, createdAt: 1, updatedAt: 1 } };

sitemapRouter.get(
  "/sitemap.xml",
  asyncHandler(async (_req, res) => {
    const [blogs, stories, jobs] = await Promise.all([
      collections.blog.find({}, FIELDS).toArray(),
      collections.successStory.find({}, FIELDS).toArray(),
      collections.career.find({}, FIELDS).toArray(),
    ]);
    // Vercel's CDN keeps it for an hour, so crawlers rarely reach the database.
    res.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    res.type("application/xml").send(sitemapXml({ blogs, stories, jobs }));
  }),
);

module.exports = { sitemapRouter, sitemapXml };
