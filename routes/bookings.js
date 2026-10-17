const express = require("express");
const pool = require("../config/db");
const { requireRole } = require("../middleware/auth");
const { validDateTime, validDuration, overlaps } = require("../utils");
const router = express.Router();

router.use(requireRole("student"));

router.get("/", async (req, res, next) => {
  try {
    const [faculty] = await pool.execute(
      `SELECT id, full_name, department
       FROM users
       WHERE role='faculty' AND active=1 AND department=(SELECT department FROM users WHERE id=? AND role='student')
       ORDER BY full_name`,
      [req.session.user.id]
    );
    const [bookings] = await pool.execute(
      `SELECT b.*, u.full_name AS faculty_name, u.department
       FROM bookings b JOIN users u ON u.id=b.faculty_id
       WHERE b.student_id=? ORDER BY b.created_at DESC`,
      [req.session.user.id]
    );
    res.render("student-bookings", { title: "My consultations", faculty, bookings });
  } catch (err) { next(err); }
});

router.get("/faculty/:id/availability", async (req, res, next) => {
  try {
    const facultyId = Number(req.params.id);
    if (!Number.isInteger(facultyId) || facultyId < 1) {
      return res.status(400).json({ error: "Invalid faculty member." });
    }

    const [facultyRows] = await pool.execute(
      `SELECT f.id
       FROM users f
       JOIN users s ON s.id=?
       WHERE f.id=? AND f.role='faculty' AND f.active=1 AND f.department=s.department`,
      [req.session.user.id, facultyId]
    );
    if (!facultyRows.length) {
      return res.status(404).json({ error: "Faculty member not found." });
    }

    const [availability] = await pool.execute(
      `SELECT id, starts_at, ends_at
       FROM availability_slots
       WHERE faculty_id=? AND active=1 AND starts_at > NOW()
       ORDER BY starts_at`,
      [facultyId]
    );
    res.json({ availability });
  } catch (err) { next(err); }
});

router.post("/", async (req, res, next) => {
  try {
    const facultyId = Number(req.body.faculty_id);
    const topic = String(req.body.topic || "").trim();
    const notes = String(req.body.notes || "").trim();
    const startsAt = String(req.body.starts_at || "");
    const duration = Number(req.body.duration_minutes || 30);

    if (!Number.isInteger(facultyId) || !topic || topic.length > 120 || notes.length > 1000 ||
        !validDateTime(startsAt) || !validDuration(duration)) {
      req.flash("error", "Check the faculty, topic (1–120 characters), notes, future date/time, and duration (15–120 minutes in 15-minute steps).");
      return res.redirect("/bookings");
    }

    const [facultyRows] = await pool.execute(
      `SELECT f.id
       FROM users f
       JOIN users s ON s.id=?
       WHERE f.id=? AND f.role='faculty' AND f.active=1 AND f.department=s.department`,
      [req.session.user.id, facultyId]
    );
    if (!facultyRows.length) {
      req.flash("error", "You can only book with faculty members from your department.");
      return res.redirect("/bookings");
    }

    const [availability] = await pool.execute(
      `SELECT * FROM availability_slots WHERE faculty_id=? AND active=1
       AND starts_at <= ? AND ends_at >= ? LIMIT 1`,
      [facultyId, startsAt.replace("T", " ") + ":00",
       new Date(new Date(startsAt).getTime() + duration * 60000).toISOString().slice(0,19).replace("T"," ")]
    );
    if (!availability.length) {
      req.flash("error", "The selected time is outside the faculty member's published availability.");
      return res.redirect("/bookings");
    }

    const [existing] = await pool.execute(
      `SELECT starts_at, duration_minutes FROM bookings
       WHERE faculty_id=? AND status IN ('pending','approved')`,
      [facultyId]
    );
    if (existing.some(b => overlaps(startsAt, duration, b.starts_at, b.duration_minutes))) {
      req.flash("error", "That time conflicts with another pending or approved consultation.");
      return res.redirect("/bookings");
    }

    await pool.execute(
      `INSERT INTO bookings (student_id, faculty_id, topic, notes, starts_at, duration_minutes, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [req.session.user.id, facultyId, topic, notes || null, startsAt.replace("T", " ") + ":00", duration]
    );
    req.flash("success", "Consultation request submitted. It is pending faculty approval.");
    res.redirect("/bookings");
  } catch (err) { next(err); }
});

router.post("/:id/cancel", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [result] = await pool.execute(
      `UPDATE bookings SET status='cancelled', updated_at=CURRENT_TIMESTAMP
       WHERE id=? AND student_id=? AND status IN ('pending','approved') AND starts_at > NOW()`,
      [id, req.session.user.id]
    );
    req.flash(result.affectedRows ? "success" : "error",
      result.affectedRows ? "Consultation cancelled." : "This consultation cannot be cancelled.");
    res.redirect("/bookings");
  } catch (err) { next(err); }
});

router.post("/:id/reschedule", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const startsAt = String(req.body.starts_at || "");
    const duration = Number(req.body.duration_minutes || 30);
    const [owned] = await pool.execute(
      "SELECT * FROM bookings WHERE id=? AND student_id=? AND status IN ('pending','approved') AND starts_at > NOW()",
      [id, req.session.user.id]
    );
    if (!owned.length || !validDateTime(startsAt) || !validDuration(duration)) {
      req.flash("error", "Cannot reschedule this consultation. Check its status and the new date/time.");
      return res.redirect("/bookings");
    }
    const booking = owned[0];
    const endAt = new Date(new Date(startsAt).getTime() + duration * 60000).toISOString().slice(0,19).replace("T"," ");
    const [slots] = await pool.execute(
      `SELECT id FROM availability_slots WHERE faculty_id=? AND active=1
       AND starts_at <= ? AND ends_at >= ? LIMIT 1`,
      [booking.faculty_id, startsAt.replace("T"," ")+":00", endAt]
    );
    const [others] = await pool.execute(
      `SELECT starts_at, duration_minutes FROM bookings
       WHERE faculty_id=? AND id<>? AND status IN ('pending','approved')`,
      [booking.faculty_id, id]
    );
    if (!slots.length || others.some(b => overlaps(startsAt, duration, b.starts_at, b.duration_minutes))) {
      req.flash("error", "The new time is unavailable or conflicts with another consultation.");
      return res.redirect("/bookings");
    }
    await pool.execute(
      `UPDATE bookings SET starts_at=?, duration_minutes=?, status='pending', updated_at=CURRENT_TIMESTAMP
       WHERE id=? AND student_id=?`,
      [startsAt.replace("T"," ")+":00", duration, id, req.session.user.id]
    );
    req.flash("success", "Reschedule submitted for approval; status reset to pending.");
    res.redirect("/bookings");
  } catch (err) { next(err); }
});

module.exports = router;
