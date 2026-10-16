// models/slotModel.js
const db = require("../config/db");

exports.createSlot = (slotData, callback) => {
  const { faculty_id, slot_date, start_time, end_time } = slotData;
  db.query(
    "INSERT INTO slots (faculty_id, slot_date, start_time, end_time) VALUES (?, ?, ?, ?)",
    [faculty_id, slot_date, start_time, end_time],
    callback,
  );
};

exports.getSlotsByFaculty = (faculty_id, callback) => {
  db.query(
    "SELECT * FROM slots WHERE faculty_id = ? ORDER BY slot_date, start_time",
    [faculty_id],
    callback,
  );
};

// each slot appears once, with only its latest booking (if any)
exports.getSlotsWithBookingsByFaculty = (faculty_id, callback) => {
  db.query(
    `SELECT slots.*, bookings.status AS booking_status, bookings.purpose AS purpose, users.name AS student_name
     FROM slots
     LEFT JOIN bookings ON bookings.id = (SELECT MAX(b2.id) FROM bookings b2 WHERE b2.slot_id = slots.id)
     LEFT JOIN users ON bookings.student_id = users.id
     WHERE slots.faculty_id = ?
     ORDER BY slots.slot_date, slots.start_time`,
    [faculty_id],
    callback,
  );
};

exports.getAvailableSlots = (callback) => {
  db.query(
    `SELECT slots.*, users.name AS faculty_name, users.department
     FROM slots
     JOIN users ON slots.faculty_id = users.id
     WHERE slots.is_booked = FALSE
     ORDER BY slots.slot_date, slots.start_time`,
    callback,
  );
};

exports.getSlotById = (id, callback) => {
  db.query("SELECT * FROM slots WHERE id = ?", [id], callback);
};

exports.markSlotBooked = (id, callback) => {
  db.query("UPDATE slots SET is_booked = TRUE WHERE id = ?", [id], callback);
};

exports.deleteOpenSlot = (id, faculty_id, callback) => {
  db.query(
    "DELETE FROM slots WHERE id = ? AND faculty_id = ? AND is_booked = FALSE",
    [id, faculty_id],
    callback,
  );
};