require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const flash = require("connect-flash");
const helmet = require("helmet");
const path = require("path");
const pool = require("./config/db");

const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/bookings");
const facultyRoutes = require("./routes/faculty");
const adminRoutes = require("./routes/admin");
const { requireLogin } = require("./middleware/auth");

const app = express();

async function initializeApplication() {
  await pool.ensureDatabaseReady();
  await pool.seedDemoAccounts();

  const sessionStore = new MySQLStore({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "faculty_consultation_booking",
    createDatabaseTable: true
  });

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.urlencoded({ extended: false, limit: "20kb" }));
  app.use(express.static(path.join(__dirname, "public")));
  app.use(session({
    key: "fcbs.sid",
    secret: process.env.SESSION_SECRET || "development-only-change-this-secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 4
    }
  }));
  app.use(flash());
  app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    res.locals.successMessages = req.flash("success");
    res.locals.errorMessages = req.flash("error");
    next();
  });

  app.get("/", (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    if (req.session.user.role === "student") return res.redirect("/bookings");
    if (req.session.user.role === "faculty") return res.redirect("/faculty");
    return res.redirect("/admin");
  });

  app.use(authRoutes);
  app.use("/bookings", bookingRoutes);
  app.use("/faculty", facultyRoutes);
  app.use("/admin", adminRoutes);

  app.get("/dashboard", requireLogin, (req, res) => {
    const role = req.session.user.role;
    res.redirect(role === "student" ? "/bookings" : role === "faculty" ? "/faculty" : "/admin");
  });

  app.use((req, res) => res.status(404).render("error", {
    title: "Page not found",
    message: "The page you requested does not exist."
  }));

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).render("error", {
      title: "Something went wrong",
      message: "The request could not be completed. Please try again."
    });
  });

  const requestedPort = Number(process.env.PORT || 3000);

  const startServer = (port) => {
    const server = app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        const fallbackPort = port + 1;
        console.warn(`Port ${port} is unavailable. Trying port ${fallbackPort} instead.`);
        startServer(fallbackPort);
        return;
      }

      throw error;
    });
  };

  startServer(requestedPort);
}

initializeApplication().catch((error) => {
  console.error("Application initialization failed:", error);
  process.exit(1);
});
