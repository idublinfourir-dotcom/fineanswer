import { test } from "node:test";
import assert from "node:assert/strict";
import { redactUrl } from "./analytics.js";

const view = (url) => redactUrl({ type: "pageview", url });

test("keeps the page path", () => {
  assert.equal(view("https://www.fineanswer.net/ireland").url, "https://www.fineanswer.net/ireland");
});

test("drops the email from the real reset link the server builds", () => {
  const email = "student+1@example.com";
  const out = view(`https://www.fineanswer.net/reset-password?email=${encodeURIComponent(email)}`);
  assert.equal(out.url, "https://www.fineanswer.net/reset-password");
  assert.ok(!out.url.includes("example"));
});

test("keeps utm_* so campaign reports still work", () => {
  const out = view("https://www.fineanswer.net/?utm_source=fb&email=a%40b.com&utm_campaign=ielts");
  assert.equal(out.url, "https://www.fineanswer.net/?utm_source=fb&utm_campaign=ielts");
});

test("hostile input: token-like params, odd casing, repeats, hash secrets", () => {
  const out = view(
    "https://www.fineanswer.net/x?token=t&otp=1234&EMAIL=a%40b.com&UTM_SOURCE=x&email=1&email=2&utm_x=ok#access_token=secret"
  );
  assert.equal(out.url, "https://www.fineanswer.net/x?utm_x=ok");
});

test("hostile input: unparseable URL is dropped, never sent raw", () => {
  assert.equal(redactUrl({ type: "pageview", url: "not a url ?email=a@b.com" }), null);
  assert.equal(redactUrl({ type: "pageview" }), null);
  assert.equal(redactUrl(null), null);
});

test("keeps the rest of the event (custom events)", () => {
  const out = redactUrl({ type: "event", url: "https://www.fineanswer.net/?q=1", name: "signup" });
  assert.deepEqual(out, { type: "event", url: "https://www.fineanswer.net/", name: "signup" });
});

test("performance: 10k events redact in under 200 ms", () => {
  const url = "https://www.fineanswer.net/search-results?level=msc&country=ireland&utm_source=fb";
  const start = performance.now();
  for (let i = 0; i < 10_000; i++) view(url);
  const ms = performance.now() - start;
  assert.ok(ms < 200, `took ${ms.toFixed(1)} ms`);
});
