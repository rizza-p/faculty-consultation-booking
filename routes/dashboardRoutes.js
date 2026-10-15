// routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { requireLogin } = require("../middleware/authMiddleware");

router.get("/dashboard", requireLogin, dashboardController.showDashboard);

module.exports = router;
