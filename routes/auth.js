const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../config/db");
const { requireLogin } = require("../middleware/auth");
const router = express.Router();
const demoSignupEmails = new Set(["student@example.com", "faculty@example.com"]);
const validDepartments = [
  "College of Computer Studies",
  "College of Engineering and Architecture",
  "College of Arts and Science",
  "College of Health Science",
  "College of Technological and Development Education",
  "College of Tourism, Hospitality, and Business Management"
];

router.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/");
  res.render("login", { title: "Log in" });
});

router.get("/register", (req, res) => {
  if (req.session.user) return res.redirect("/");
  res.render("register", { title: "Create an account" });
});

router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!email || !password || email.length > 190 || password.length > 200) {
      req.flash("error", "Enter a valid email and password.");
      return res.redirect("/login");
    }
    const [rows] = await pool.execute(
      "SELECT id, full_name, email, password_hash, role, department, active FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    const user = rows[0];
    if (!user || !user.active || !(await bcrypt.compare(password, user.password_hash))) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }
    req.session.regenerate(err => {
      if (err) return next(err);
      req.session.user = {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        department: user.department || null
      };
      req.session.save(err2 => {
        if (err2) return next(err2);
        res.redirect("/");
      });
    });
  } catch (err) { next(err); }
});

router.post("/register", async (req, res, next) => {
  const fullName = String(req.body.fullName || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const confirmPassword = String(req.body.confirmPassword || "");
  const role = String(req.body.role || "");
  const department = String(req.body.department || "").trim();
  const validEmail = /^[^\s@]+@[^\s@]+$/.test(email) &&
    (email.endsWith("@my.cspc.edu.ph") || demoSignupEmails.has(email));

  if (!fullName || fullName.length > 120 || !validEmail || email.length > 190 ||
      !["student", "faculty"].includes(role) ||
      !validDepartments.includes(department) ||
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72 ||
      password !== confirmPassword) {
    req.flash("error", "Enter a name, use your @my.cspc.edu.ph email (or a demo student/faculty email), select a valid department, pick a role, and choose a matching password of at least 8 characters (maximum 72 UTF-8 bytes).");
    return res.redirect("/register");
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await pool.execute(
      "INSERT INTO users (full_name, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?)",
      [fullName, email, passwordHash, role, department]
    );
    req.flash("success", "Your account has been created. Log in to continue.");
    res.redirect("/login");
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      req.flash("error", "An account with that email address already exists.");
      return res.redirect("/register");
    }
    next(err);
  }
});

router.post("/logout", requireLogin, (req, res, next) => {
  req.session.destroy(err => {
    if (err) return next(err);
    res.clearCookie("fcbs.sid");
    res.redirect("/login");
  });
});

module.exports = router;
