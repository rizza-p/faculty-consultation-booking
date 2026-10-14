// Load environment variables from .env
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");
const db = require("./config/db");

const app = express();

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware to read form data and serve static files (CSS, images, etc.)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Session setup (for login later)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);

// Make db available to other files (routes) later
app.set("db", db);

// Routes
const homeRoutes = require("./routes/homeRoutes");
app.use("/", homeRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/", authRoutes);

const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/", dashboardRoutes);

const slotRoutes = require("./routes/slotRoutes");
app.use("/", slotRoutes);

const bookingRoutes = require("./routes/bookingRoutes");
app.use("/", bookingRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/", adminRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
