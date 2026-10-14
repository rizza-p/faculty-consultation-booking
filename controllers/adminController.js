// controllers/adminController.js
const userModel = require("../models/userModel");
const bookingModel = require("../models/bookingModel");

exports.listUsers = (req, res) => {
  userModel.getAllUsers((err, results) => {
    if (err) {
      console.error(err);
      return res.send("Could not load users.");
    }
    res.render("adminUsers", { users: results });
  });
};

exports.listBookings = (req, res) => {
  bookingModel.getAllBookings((err, results) => {
    if (err) {
      console.error(err);
      return res.send("Could not load bookings.");
    }
    res.render("adminBookings", { bookings: results });
  });
};
