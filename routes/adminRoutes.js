// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { requireLogin, requireRole } = require("../middleware/authMiddleware");

router.get(
  "/admin/users",
  requireLogin,
  requireRole("admin"),
  adminController.listUsers,
);
router.get(
  "/admin/bookings",
  requireLogin,
  requireRole("admin"),
  adminController.listBookings,
);

module.exports = router;
