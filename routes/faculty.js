const express = require("express");
const pool = require("../config/db");
const { requireRole } = require("../middleware/auth");
const { validDateTime } = require("../utils");
const router = express.Router();
router.use(requireRole("faculty"));

router.get("/", async (req, res, next) => {
  try {
    const [bookings] = await pool.execute(
      `SELECT b.*, s.full_name AS student_name, s.email AS student_email
       FROM bookings b JOIN users s ON s.id=b.student_id
       WHERE b.faculty_id=? ORDER BY b.starts_at DESC`,
      [req.session.user.id]
    );
    const [slots] = await pool.execute(
      "SELECT * FROM availability_slots WHERE faculty_id=? ORDER BY starts_at DESC",
      [req.session.user.id]
    );
    res.render("faculty-dashboard", { title: "Faculty dashboard", bookings, slots });
  } catch (err) { next(err); }
});

router.post("/availability", async (req, res, next) => {
  try {
    const startsAt = String(req.body.starts_at || "");
    const endsAt = String(req.body.ends_at || "");
    if (!validDateTime(startsAt) || !endsAt || !Number.isFinite(new Date(endsAt).getTime()) ||
        new Date(endsAt) <= new Date(startsAt)) {
      req.flash("error", "Enter a future start time and a later end time.");
      return res.redirect("/faculty");
    }
    const startSql = startsAt.replace("T"," ")+":00";
    const endSql = endsAt.replace("T"," ")+":00";
    const [result] = await pool.execute(
      "INSERT INTO availability_slots (faculty_id, starts_at, ends_at, active) VALUES (?, ?, ?, 1)",
      [req.session.user.id, startSql, endSql]
    );
    req.flash("success", "Availability slot published.");
    res.redirect("/faculty");
  } catch (err) { next(err); }
});

router.post("/availability/:id/toggle", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [result] = await pool.execute(
      "UPDATE availability_slots SET active=IF(active=1,0,1) WHERE id=? AND faculty_id=?",
      [id, req.session.user.id]
    );
    req.flash(result.affectedRows ? "success" : "error",
      result.affectedRows ? "Availability updated." : "Availability slot not found.");
    res.redirect("/faculty");
  } catch (err) { next(err); }
});

router.post("/bookings/:id/status", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const status = String(req.body.status || "");
    if (!["approved", "rejected", "completed"].includes(status)) {
      req.flash("error", "Invalid status.");
      return res.redirect("/faculty");
    }
    const [result] = await pool.execute(
      `UPDATE bookings SET status=?, updated_at=CURRENT_TIMESTAMP
       WHERE id=? AND faculty_id=? AND
       ((status='pending' AND ? IN ('approved','rejected')) OR
        (status='approved' AND ?='completed' AND starts_at < NOW()))`,
      [status, id, req.session.user.id, status, status]
    );
    req.flash(result.affectedRows ? "success" : "error",
      result.affectedRows ? `Booking marked ${status}.` : "This booking cannot be changed to that status.");
    res.redirect("/faculty");
  } catch (err) { next(err); }
});

module.exports = router;
