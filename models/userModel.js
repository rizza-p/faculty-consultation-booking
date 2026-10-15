// models/userModel.js
const db = require("../config/db");

// Find a user by email (used for login and checking duplicates)
exports.findByEmail = (email, callback) => {
  db.query("SELECT * FROM users WHERE email = ?", [email], callback);
};

// Create a new user
exports.createUser = (userData, callback) => {
  const { name, email, password, role, department } = userData;
  db.query(
    "INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)",
    [name, email, password, role, department],
    callback,
  );
};

exports.getAllUsers = (callback) => {
  db.query(
    "SELECT id, name, email, role, department, created_at FROM users ORDER BY created_at DESC",
    callback,
  );
};
