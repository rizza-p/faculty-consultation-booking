// routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { requireLogin, requireRole } = require("../middleware/authMiddleware");

router.post(
  "/slots/:id/book",
  requireLogin,
  requireRole("student"),
  bookingController.bookSlot,
);
router.get(
  "/my-bookings",
  requireLogin,
  requireRole("student"),
  bookingController.myBookings,
);

router.get(
  "/faculty-bookings",
  requireLogin,
  requireRole("faculty"),
  bookingController.facultyBookings,
);
router.post(
  "/bookings/:id/status",
  requireLogin,
  requireRole("faculty"),
  bookingController.updateStatus,
);

router.post(
  "/my-bookings/:id/cancel",
  requireLogin,
  requireRole("student"),
  bookingController.cancelBooking,
);

module.exports = router;