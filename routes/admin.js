const express = require("express");
const pool = require("../config/db");
const { requireRole } = require("../middleware/auth");
const router = express.Router();
router.use(requireRole("admin"));

router.get("/", async (req, res, next) => {
  try {
    const [[counts]] = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM users WHERE role='student' AND active=1) AS students,
        (SELECT COUNT(*) FROM users WHERE role='faculty' AND active=1) AS faculty,
        (SELECT COUNT(*) FROM bookings) AS total_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status='pending') AS pending_bookings`
    );
    const [users] = await pool.query(
      "SELECT id, full_name, email, role, department, active, created_at FROM users ORDER BY role, full_name"
    );
    const [bookings] = await pool.query(
      `SELECT b.*, s.full_name AS student_name, f.full_name AS faculty_name
       FROM bookings b JOIN users s ON s.id=b.student_id JOIN users f ON f.id=b.faculty_id
       ORDER BY b.created_at DESC LIMIT 100`
    );
    res.render("admin-dashboard", { title: "Admin dashboard", counts, users, bookings });
  } catch (err) { next(err); }
});

router.post("/users/:id/toggle", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (id === req.session.user.id) {
      req.flash("error", "You cannot deactivate your own account.");
      return res.redirect("/admin");
    }
    const [result] = await pool.execute(
      "UPDATE users SET active=IF(active=1,0,1) WHERE id=?",
      [id]
    );
    req.flash(result.affectedRows ? "success" : "error",
      result.affectedRows ? "User account status updated." : "User not found.");
    res.redirect("/admin");
  } catch (err) { next(err); }
});

module.exports = router;
