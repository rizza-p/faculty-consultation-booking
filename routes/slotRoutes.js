// routes/slotRoutes.js
const express = require("express");
const router = express.Router();
const slotController = require("../controllers/slotController");
const { requireLogin, requireRole } = require("../middleware/authMiddleware");

router.get(
  "/slots/new",
  requireLogin,
  requireRole("faculty"),
  slotController.showSlotForm,
);
router.post(
  "/slots/new",
  requireLogin,
  requireRole("faculty"),
  slotController.createSlot,
);

router.get(
  "/slots",
  requireLogin,
  requireRole("student"),
  slotController.listAvailableSlots,
);

router.get(
  "/my-slots",
  requireLogin,
  requireRole("faculty"),
  slotController.mySlots,
);
router.post(
  "/my-slots/:id/cancel",
  requireLogin,
  requireRole("faculty"),
  slotController.cancelSlot,
);

module.exports = router;