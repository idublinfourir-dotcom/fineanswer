// Runs the real server with an in-memory users collection and a fake Google
// signing key, so the auth paths can be checked without MongoDB or Google.
// Run: npm test
const test = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const crypto = require("node:crypto");
const path = require("node:path");
const jwt = require("jsonwebtoken");

process.env.VERCEL = "1"; // makes index.js export a handler instead of listening
process.env.JWT_SECRET = "test-secret";

// ── In-memory stand-in for the users collection ────────────────────────────
const users = [];
const matches = (doc, query) =>
  Object.entries(query).every(([k, q]) => {
    const v = doc[k];
    if (q && typeof q === "object" && !(q instanceof Date) && !q._bsontype) {
      if ("$gt" in q) return v > q.$gt;
      if ("$not" in q) return !(v >= q.$not.$gte);
    }
    return String(v) === String(q);
  });
const apply = (doc, u) => {
  Object.assign(doc, u.$set);
  for (const k of Object.keys(u.$unset || {})) delete doc[k];
  for (const [k, n] of Object.entries(u.$inc || {})) doc[k] = (doc[k] || 0) + n;
};
const usersCollection = {
  findOne: async (q) => users.find((d) => matches(d, q)) || null,
  updateOne: async (q, u) => {
    const d = users.find((x) => matches(x, q));
    if (d) apply(d, u);
  },
  insertOne: async (doc) => {
    const _id = new (require("mongodb").ObjectId)();
    users.push({ ...doc, _id });
    return { insertedId: _id };
  },
  findOneAndUpdate: async (q, u) => {
    const d = users.find((x) => matches(x, q));
    if (!d) return null;
    const before = { ...d };
    apply(d, u);
    return before;
  },
};
require.cache[path.join(__dirname, "../config/db.js")] = {
  exports: {
    collections: { users: usersCollection },
    connectDB: async () => {},
  },
};

// ── Fake Google signing key served from the Firebase certs URL ─────────────
const google = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
const attacker = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
const realFetch = global.fetch;
global.fetch = async (url, opts) =>
  String(url).includes("securetoken@system.gserviceaccount.com")
    ? new Response(
        JSON.stringify({ k1: google.publicKey.export({ type: "spki", format: "pem" }) }),
        { headers: { "cache-control": "public, max-age=3600" } },
      )
    : realFetch(url, opts);

const firebaseToken = (claims, key = google.privateKey) =>
  jwt.sign(
    {
      email: "student@gmail.com",
      email_verified: true,
      firebase: { sign_in_provider: "google.com" },
      ...claims,
    },
    key,
    {
      algorithm: "RS256",
      keyid: "k1",
      audience: "fineanswer-e4c30",
      issuer: "https://securetoken.google.com/fineanswer-e4c30",
      subject: "firebase-uid-1",
      expiresIn: "1h",
    },
  );

let base, server;
test.before(async () => {
  server = http.createServer(require("../index.js")).listen(0);
  await new Promise((r) => server.once("listening", r));
  base = `http://localhost:${server.address().port}`;
});
test.after(() => server.close());

const post = async (p, body) => {
  const res = await realFetch(base + p, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
};

test("google login rejects requests without a token (the old forgeable shape)", async () => {
  const r = await post("/api/auth/google", { email: "admin@x.com", googleId: "anything" });
  assert.equal(r.status, 400);
  assert.equal(users.length, 0);
});

test("google login rejects tokens not signed by Google", async () => {
  const r = await post("/api/auth/google", { idToken: firebaseToken({}, attacker.privateKey) });
  assert.equal(r.status, 401);
});

test("google login rejects non-google or unverified-email tokens", async () => {
  for (const claims of [
    { firebase: { sign_in_provider: "password" } },
    { email_verified: false },
  ]) {
    const r = await post("/api/auth/google", { idToken: firebaseToken(claims) });
    assert.equal(r.status, 401);
  }
});

test("google login with a valid token creates the user from token claims only", async () => {
  const r = await post("/api/auth/google", {
    idToken: firebaseToken({}),
    email: "victim@x.com", // body identity is ignored
    googleId: "spoofed",
    name: "Student",
  });
  assert.equal(r.status, 200);
  assert.ok(r.body.token);
  assert.equal(r.body.data.email, "student@gmail.com");
  assert.equal(r.body.data.googleId, "firebase-uid-1");

  const again = await post("/api/auth/google", { idToken: firebaseToken({}) });
  assert.equal(again.status, 200);
  assert.equal(users.length, 1, "second login reuses the same account");
});

test("register refuses unverified google accounts", async () => {
  const r = await post("/api/users", {
    name: "x", email: "new@x.com", authProvider: "google", googleId: "x",
  });
  assert.equal(r.status, 400);
  assert.match(r.body.message, /Sign in with Google/);
});

test("reset-password blocks operator injection and brute force", async () => {
  users.push({
    _id: "u2", email: "a@b.com", authProvider: "email", password: "old",
    resetOtp: "123456", resetOtpExpiry: new Date(Date.now() + 60000), resetOtpAttempts: 0,
  });
  const inj = await post("/api/auth/reset-password", {
    email: "a@b.com", otp: { $ne: "" }, newPassword: "hacked1",
  });
  assert.equal(inj.status, 400);
  assert.equal(inj.body.message, "Invalid request body");

  for (let i = 0; i < 5; i++) {
    const r = await post("/api/auth/reset-password", {
      email: "a@b.com", otp: "000000", newPassword: "newpass1",
    });
    assert.equal(r.status, 400);
  }
  const locked = await post("/api/auth/reset-password", {
    email: "a@b.com", otp: "123456", newPassword: "newpass1",
  });
  assert.equal(locked.status, 400, "correct OTP refused after 5 failed attempts");
  assert.equal(users.find((u) => u._id === "u2").password, "old");
});

test("reset-password works with the right OTP", async () => {
  users.push({
    _id: "u3", email: "c@d.com", authProvider: "email", password: "old",
    resetOtp: "654321", resetOtpExpiry: new Date(Date.now() + 60000),
  });
  const r = await post("/api/auth/reset-password", {
    email: "c@d.com", otp: "654321", newPassword: "newpass1",
  });
  assert.equal(r.status, 200);
  const u = users.find((x) => x._id === "u3");
  assert.notEqual(u.password, "old");
  assert.equal(u.resetOtp, undefined);
});

test("public user lookup routes are gone", async () => {
  for (const p of ["/api/users/email/a@b.com", "/api/users/google/x", "/api/users/507f1f77bcf86cd799439011"]) {
    const res = await realFetch(base + p);
    assert.equal(res.status, 404);
  }
});
