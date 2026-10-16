// controllers/authController.js
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// admin is NOT allowed here: admins are set manually in the database
const ALLOWED_ROLES = ["student", "faculty"];

// Show the registration form
exports.showRegister = (req, res) => {
  res.render("register", { error: null });
};

// Handle the registration form submission
exports.register = (req, res) => {
  const name = (req.body.name || "").trim();
  const email = (req.body.email || "").trim();
  const password = req.body.password || "";
  const role = req.body.role;
  const department = (req.body.department || "").trim();

  // ----- validate input before saving anything -----
  const fail = (message) => res.render("register", { error: message });

  if (!name || !email || !password || !role) {
    return fail("Name, email, password and role are required.");
  }
  if (name.length > 100) {
    return fail("Name is too long (100 characters maximum).");
  }
  if (!EMAIL_RE.test(email) || email.length > 100) {
    return fail("Please enter a valid email address.");
  }
  if (password.length < 8) {
    return fail("Password must be at least 8 characters.");
  }
  if (!ALLOWED_ROLES.includes(role)) {
    return fail("Please choose Student or Faculty.");
  }
  if (department.length > 100) {
    return fail("Department is too long (100 characters maximum).");
  }

  // Check if email is already used
  userModel.findByEmail(email, async (err, results) => {
    if (err) {
      console.error(err);
      return fail("Something went wrong. Try again.");
    }

    if (results.length > 0) {
      return fail("That email is already registered.");
    }

    try {
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      userModel.createUser(
        { name, email, password: hashedPassword, role, department },
        (err) => {
          if (err) {
            console.error(err);
            return fail("Could not create account.");
          }
          res.redirect("/login");
        },
      );
    } catch (err) {
      console.error(err);
      fail("Something went wrong. Try again.");
    }
  });
};

// Show the login form
exports.showLogin = (req, res) => {
  res.render("login", { error: null });
};

// Handle login form submission
exports.login = (req, res) => {
  const email = (req.body.email || "").trim();
  const password = req.body.password || "";

  if (!email || !password) {
    return res.render("login", { error: "Please enter your email and password." });
  }

  userModel.findByEmail(email, async (err, results) => {
    if (err) {
      console.error(err);
      return res.render("login", { error: "Something went wrong. Try again." });
    }

    if (results.length === 0) {
      return res.render("login", { error: "Invalid email or password." });
    }

    const user = results[0];

    try {
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.render("login", { error: "Invalid email or password." });
      }
    } catch (err) {
      console.error(err);
      return res.render("login", { error: "Something went wrong. Try again." });
    }

    // Save user info in the session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.redirect("/dashboard");
  });
};

// Log out
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};