const express = require("express");
const path = require("path");
const {ConnectToOnlineDB} = require("./config/db")
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require('morgan');
const session = require("express-session");

// Middlewares
// const logger = require("./middlewares/logger");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const { verifySession } = require("./middlewares/verifySession");

dotenv.config();

// ------------------
// MongoDB Connection
// ------------------
ConnectToOnlineDB();

// ------------------
// Express Setup
// ------------------
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
// app.use(logger);
// Static Pages
app.use(express.static(path.resolve(__dirname, "pages")));
// ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
/**
 *  important stuf
 **/

// ------------------
// CORS for fetch() + cookies
// ------------------
app.use(
  cors({
    origin: "http://localhost:9000", 
    credentials: true, // allow cookies
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
      secure: process.env.NODE_ENV === "production" ? true : false,

    },
  })
);


// ------------------
// Routes
// root
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "pages", "index.html"));
});

// Page Routes (excluding root)
app.use("/", require("./Routes/pages"));
// API Routes
app.use("/api/auth", require("./Routes/auth"));
app.use("/api/user", require("./Routes/user"));


// 404 / Error handler
app.use(notFound);
app.use(errorHandler);


// Server Start
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
