const { MongoClient, ServerApiVersion } = require("mongodb");

const dbUser = (process.env.DB_USER || "").trim();
const dbPassword = (process.env.DB_PASSWORD || "").trim();
const defaultHost = "cluster1.pvs4l8x.mongodb.net";

const uri =
  (process.env.MONGODB_URI || "").trim() ||
  `mongodb+srv://${encodeURIComponent(dbUser)}:${encodeURIComponent(dbPassword)}@${defaultHost}/?appName=Cluster1`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// All collection references (populated in connectDB)
const collections = {
  users: null,
  successStory: null,
  blog: null,
  session: null,
  events: null,
  career: null,
  careerApplications: null,
  documents: null,
  payment: null,
};

const connectWithRetry = async (attempts = 5, baseDelay = 1000) => {
  for (let i = 0; i < attempts; i++) {
    try {
      await client.connect();
      console.log("Connected to MongoDB");
      return;
    } catch (err) {
      console.error(
        `MongoDB connection attempt ${i + 1} failed:`,
        err && err.message,
      );
      if (i === attempts - 1) throw err;
      const wait = baseDelay * Math.pow(2, i);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
};

const connectDB = async () => {
  // Set reliable DNS servers to avoid transient SRV lookup failures
  const dns = require("dns");
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch (e) {
    console.warn("Failed to set DNS servers (continuing):", e && e.message);
  }

  await connectWithRetry();

  const db = client.db("FineAnswer");
  collections.users              = db.collection("usersCollection");
  collections.successStory       = db.collection("successStory");
  collections.blog               = db.collection("blog");
  collections.session            = db.collection("session");
  collections.events             = db.collection("events");
  collections.career             = db.collection("careerCollection");
  collections.careerApplications = db.collection("careerApplications");
  collections.documents          = db.collection("documentsCollection");
  collections.payment            = db.collection("paymentCollection");
};

module.exports = { client, collections, connectDB };
