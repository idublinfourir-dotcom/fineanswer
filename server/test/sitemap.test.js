// Runs the real server with in-memory collections (no MongoDB, no network).
// Run: npm test
const test = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const path = require("node:path");

process.env.VERCEL = "1"; // makes index.js export a handler instead of listening
process.env.JWT_SECRET = "test-secret";

// ── In-memory collections that record every query ──────────────────────────
const calls = [];
const collection = (name, docs) => ({
  find: (query, options = {}) => {
    calls.push({ name, query, options });
    const keep = options.projection;
    const out = keep
      ? docs.map((d) => Object.fromEntries(Object.entries(d).filter(([k]) => k === "_id" || keep[k])))
      : docs;
    return { toArray: async () => out };
  },
});

const blogs = [
  {
    _id: "6650a1b2c3d4e5f6a7b8c9d0",
    title: "Study in Ireland: 2026 Guide!",
    content: "SECRET-BLOG-BODY",
    authorId: "admin-user-id",
    createdAt: new Date("2026-05-01T10:00:00Z"),
    updatedAt: new Date("2026-06-02T10:00:00Z"),
  },
  {
    _id: "6650a1b2c3d4e5f6a7b8c9d1",
    title: '</loc><script>alert(1)</script> & "x"',
    createdAt: "not a date",
  },
];
const stories = [
  {
    _id: "6650a1b2c3d4e5f6a7b8c9e0",
    name: "Student Name",
    story: "SECRET-STORY-TEXT",
    email: "student@example.com",
    createdAt: new Date("2026-04-01T00:00:00Z"),
  },
];
const jobs = [{ _id: "<job&id>", title: "Counsellor", createdAt: new Date("2026-03-01T00:00:00Z") }];

require.cache[path.join(__dirname, "../config/db.js")] = {
  exports: {
    collections: {
      blog: collection("blog", blogs),
      successStory: collection("successStory", stories),
      career: collection("career", jobs),
      users: collection("users", []),
    },
    connectDB: async () => {},
  },
};

const { sitemapXml } = require("../routes/sitemap");

let base, server;
test.before(async () => {
  server = http.createServer(require("../index.js")).listen(0);
  await new Promise((r) => server.once("listening", r));
  base = `http://localhost:${server.address().port}`;
});
test.after(() => server.close());

// ── Unit: the XML builder on its own ───────────────────────────────────────
test("unit: static pages, slugged blog URLs and lastmod dates", () => {
  const xml = sitemapXml({ blogs, stories, jobs: [] });
  for (const p of ["/", "/ireland", "/uk", "/australia", "/blog", "/career", "/read-more-info"]) {
    assert.ok(xml.includes(`<loc>https://www.fineanswer.net${p}</loc>`), p);
  }
  assert.ok(
    xml.includes(
      "<loc>https://www.fineanswer.net/blog/study-in-ireland-2026-guide-6650a1b2c3d4e5f6a7b8c9d0</loc><lastmod>2026-06-02</lastmod>",
    ),
  );
  assert.ok(xml.includes("/success-story/6650a1b2c3d4e5f6a7b8c9e0</loc><lastmod>2026-04-01</lastmod>"));
});

test("unit: a bad date drops lastmod instead of crashing", () => {
  const xml = sitemapXml({ blogs: [blogs[1]], stories: [], jobs: [] });
  assert.match(xml, /loc>https:\/\/www\.fineanswer\.net\/blog\/loc-script-alert-1-script-x-6650a1b2c3d4e5f6a7b8c9d1<\/loc><\/url>/);
});

test("security: hostile titles and ids cannot break out of the XML", () => {
  const xml = sitemapXml({ blogs, stories, jobs });
  assert.ok(!xml.includes("<script>"));
  assert.ok(xml.includes("/jobs/&#60;job&#38;id&#62;</loc>"));
  // every <loc> holds only URL-safe characters or entities
  for (const [, loc] of xml.matchAll(/<loc>(.*?)<\/loc>/g)) assert.match(loc, /^https:\/\/www\.fineanswer\.net\/[\w\-/&#;]*$/);
});

// ── Integration: the real route ────────────────────────────────────────────
test("integration: GET /sitemap.xml serves cached XML with every public page", async () => {
  calls.length = 0;
  const res = await fetch(`${base}/sitemap.xml`);
  const xml = await res.text();
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /application\/xml/);
  assert.match(res.headers.get("cache-control"), /s-maxage=3600/);
  assert.equal((xml.match(/<url>/g) || []).length, 7 + blogs.length + stories.length + jobs.length);
});

test("security: no auth needed, and nothing private leaks into the sitemap", async () => {
  const res = await fetch(`${base}/sitemap.xml`, { headers: { Authorization: "Bearer not-a-real-token" } });
  const xml = await res.text();
  assert.equal(res.status, 200);
  for (const secret of ["SECRET-BLOG-BODY", "SECRET-STORY-TEXT", "student@example.com", "admin-user-id", "Student Name"]) {
    assert.ok(!xml.includes(secret), secret);
  }
});

test("security: the query string never reaches the database query", async () => {
  calls.length = 0;
  await fetch(`${base}/sitemap.xml?$where=1&title[$ne]=x`);
  assert.deepEqual(calls.map((c) => c.query), [{}, {}, {}]);
  assert.equal((await fetch(`${base}/sitemap.xml`, { method: "POST" })).status, 404);
});

test("performance: 3 queries, bodies never fetched, 3k docs under 300 ms", async () => {
  const many = Array.from({ length: 1000 }, (_, i) => ({
    _id: i.toString(16).padStart(24, "0"),
    title: `Post number ${i}`,
    content: "x".repeat(5000),
    createdAt: new Date("2026-01-01"),
  }));
  blogs.push(...many);
  stories.push(...many);
  jobs.push(...many);
  calls.length = 0;
  const start = performance.now();
  const res = await fetch(`${base}/sitemap.xml`);
  const xml = await res.text();
  const ms = performance.now() - start;

  assert.equal(calls.length, 3, "one query per collection");
  for (const c of calls) assert.deepEqual(c.options.projection, { title: 1, createdAt: 1, updatedAt: 1 });
  assert.ok(!xml.includes("xxxxx"), "post bodies are not read");
  assert.ok(ms < 300, `took ${ms.toFixed(1)} ms`);
});
