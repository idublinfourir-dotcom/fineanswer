import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { PAGES, blogIdFrom, blogPath, headTags, pageSeo, slugify, snippet } from "./seo.js";

const ID = "6650a1b2c3d4e5f6a7b8c9d0";
const read = (rel) => fs.readFileSync(new URL(rel, import.meta.url), "utf8");

test("page tags: canonical and og:url only when a path is given", () => {
  const withPath = headTags(pageSeo("/ireland"));
  assert.ok(withPath.includes('<link data-seo rel="canonical" href="https://www.fineanswer.net/ireland">'));
  assert.ok(withPath.includes('property="og:url" content="https://www.fineanswer.net/ireland"'));
  assert.ok(withPath.includes(`<title data-seo>${PAGES["/ireland"].title}</title>`));

  const noPath = headTags({});
  assert.ok(!noPath.includes("canonical"));
  assert.ok(!noPath.includes("og:url"));
  assert.ok(!noPath.includes("noindex"));
  assert.ok(headTags({ noindex: true }).includes('<meta data-seo name="robots" content="noindex">'));
});

test("page tags: image size only for the default share image", () => {
  assert.ok(headTags({}).includes("og:image:width"));
  const custom = headTags({ image: "https://res.cloudinary.com/x/image/upload/a.jpg" });
  assert.ok(custom.includes('content="https://res.cloudinary.com/x/image/upload/a.jpg"'));
  assert.ok(!custom.includes("og:image:width"));
});

test("security: hostile titles and descriptions are escaped", () => {
  const evil = '"><script>alert(1)</script><meta x="';
  const html = headTags({ title: evil, description: evil, path: '/blog/"><img src=x onerror=alert(1)>' });
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes("<img"));
  assert.ok(html.includes("&quot;&gt;&lt;script&gt;"));
});

test("security: JSON-LD cannot close its own script tag", () => {
  const html = headTags({ jsonLd: { headline: "</script><script>alert(1)</script>" } });
  assert.equal(html.match(/<\/script>/g).length, 1);
  assert.ok(html.includes("\\u003c/script>"));
});

test("blog URLs: slug plus id, and the id is recovered from any form", () => {
  assert.equal(slugify("Study in Ireland: 2026 Guide!"), "study-in-ireland-2026-guide");
  assert.equal(slugify("Café & Visa"), "cafe-visa");
  assert.equal(slugify("আয়ারল্যান্ডে পড়াশোনা"), ""); // non-Latin title: id-only URL
  assert.equal(blogPath({ _id: ID, title: "Study in Ireland: 2026 Guide!" }), `/blog/study-in-ireland-2026-guide-${ID}`);
  assert.equal(blogPath({ _id: ID, title: "আয়ারল্যান্ডে" }), `/blog/${ID}`);
  assert.equal(blogIdFrom(`study-in-ireland-2026-guide-${ID}`), ID);
  assert.equal(blogIdFrom(ID), ID); // old /blog/<id> links
});

test("security: hostile blog URL params never become an API path", () => {
  for (const p of ["../users", `../${ID}`, `x${ID}`, "<script>", "", undefined, `${ID}/../../admin`]) {
    assert.equal(blogIdFrom(p), null, String(p));
  }
});

test("snippet: trims to ~155 chars on a word boundary and drops **bold** marks", () => {
  assert.equal(snippet("**Big** news\n\nhere"), "Big news here");
  const long = snippet("word ".repeat(100));
  assert.ok(long.length <= 155 && long.endsWith("..."));
  assert.equal(snippet(undefined), "");
});

test("config: every pre-rendered page has a vercel.json rewrite before the catch-all", () => {
  const { rewrites } = JSON.parse(read("../vercel.json"));
  const last = rewrites.at(-1);
  assert.deepEqual(last, { source: "/(.*)", destination: "/spa.html" });
  for (const path of Object.keys(PAGES).filter((p) => p !== "/")) {
    const i = rewrites.findIndex((r) => r.source === path);
    assert.ok(i >= 0 && rewrites[i].destination === `${path}.html`, path);
  }
  assert.ok(rewrites.findIndex((r) => r.source === "/sitemap.xml") < rewrites.length - 1);
});

test("config: the server sitemap builds blog URLs with the same slug rule", () => {
  const body = (src) => /const slugify = \(s\) =>([\s\S]*?);\n/.exec(src)[1].replace(/\s+/g, "");
  assert.equal(body(read("../../server/routes/sitemap.js")), body(read("./seo.js")));
});

test("config: the server sitemap lists the same static pages", () => {
  const server = read("../../server/routes/sitemap.js");
  const list = /STATIC_PAGES = (\[[^\]]*\])/.exec(server)[1];
  assert.deepEqual(JSON.parse(list), Object.keys(PAGES));
});

test("performance: 10k tag sets build in under 200 ms", () => {
  const seo = { ...pageSeo("/ireland"), jsonLd: { headline: "x".repeat(200) } };
  const start = performance.now();
  for (let i = 0; i < 10_000; i++) headTags(seo);
  const ms = performance.now() - start;
  assert.ok(ms < 200, `took ${ms.toFixed(1)} ms`);
});
