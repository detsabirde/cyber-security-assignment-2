const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");

// Middlewares
const logger = require("./middlewares/logger");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const { verifySession } = require("./middlewares/verifySession");

dotenv.config();

// ------------------
// MongoDB Connection
// ------------------
mongoose
  .connect(
    "mongodb://publicUserName:publicUserName@ac-4hoisbi-shard-00-00.6vrrysl.mongodb.net:27017,ac-4hoisbi-shard-00-01.6vrrysl.mongodb.net:27017,ac-4hoisbi-shard-00-02.6vrrysl.mongodb.net:27017/?replicaSet=atlas-h6vm8t-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("Connected to Online DB successfully"))
  .catch((error) => console.log(`Failed to connect to MongoDB: ${error}`));

// ------------------
// Express Setup
// ------------------
const app = express();

// Middlewares
app.use(express.json());
app.use(logger);

// ------------------
// CORS for fetch() + cookies
// ------------------
app.use(
  cors({
    origin: "http://localhost:9000", // where your HTML frontend is served
    credentials: true, // allow cookies to be sent
  })
);

// ------------------
// Session Setup
// ------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000, // 1 hour
      httpOnly: true,
      secure: false, // true in production with HTTPS
    },
  })
);

// ------------------
// Static Pages
// ------------------
app.use(express.static(path.resolve(__dirname, "pages")));

// ------------------
// Routes
// ------------------

// Public: Root (Home)
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "pages", "index.html"));
});

// Public: Login
app.get("/login", (req, res) => {
  res.sendFile(path.resolve(__dirname, "pages", "login.html"));
});

// Protected: My Account
app.get("/my-account", verifySession, (req, res) => {
  console.log("Session exists for user:", req.session.user);
  res.sendFile(path.resolve(__dirname, "pages", "account.html"));
});

// API Route
app.use("/api/auth", require("./Routes/auth"));

// 404 / Error handler
app.use(notFound);
app.use(errorHandler);

// ------------------
// Server Start
// ------------------
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
