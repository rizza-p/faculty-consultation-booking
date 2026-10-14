// controllers/authController.js
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

// Show the registration form
exports.showRegister = (req, res) => {
  res.render("register", { error: null });
};

// Handle the registration form submission
exports.register = async (req, res) => {
  const { name, email, password, role, department } = req.body;

  try {
    // Check if email is already used
    userModel.findByEmail(email, async (err, results) => {
      if (err) {
        console.error(err);
        return res.render("register", {
          error: "Something went wrong. Try again.",
        });
      }

      if (results.length > 0) {
        return res.render("register", {
          error: "That email is already registered.",
        });
      }

      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      userModel.createUser(
        { name, email, password: hashedPassword, role, department },
        (err) => {
          if (err) {
            console.error(err);
            return res.render("register", {
              error: "Could not create account.",
            });
          }
          res.redirect("/login");
        },
      );
    });
  } catch (err) {
    console.error(err);
    res.render("register", { error: "Something went wrong. Try again." });
  }
};

// Show the login form
exports.showLogin = (req, res) => {
  res.render("login", { error: null });
};

// Handle login form submission
exports.login = (req, res) => {
  const { email, password } = req.body;

  userModel.findByEmail(email, async (err, results) => {
    if (err) {
      console.error(err);
      return res.render("login", { error: "Something went wrong. Try again." });
    }

    if (results.length === 0) {
      return res.render("login", { error: "Invalid email or password." });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.render("login", { error: "Invalid email or password." });
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
