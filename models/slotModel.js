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
