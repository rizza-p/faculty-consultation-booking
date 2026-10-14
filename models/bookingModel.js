// models/bookingModel.js
const db = require("../config/db");

exports.createBooking = (bookingData, callback) => {
  const { slot_id, student_id, faculty_id, purpose } = bookingData;
  db.query(
    "INSERT INTO bookings (slot_id, student_id, faculty_id, purpose) VALUES (?, ?, ?, ?)",
    [slot_id, student_id, faculty_id, purpose],
    callback,
  );
};

exports.getBookingsByStudent = (student_id, callback) => {
  db.query(
    `SELECT bookings.*, slots.slot_date, slots.start_time, slots.end_time, users.name AS faculty_name
     FROM bookings
     JOIN slots ON bookings.slot_id = slots.id
     JOIN users ON bookings.faculty_id = users.id
     WHERE bookings.student_id = ?
     ORDER BY slots.slot_date, slots.start_time`,
    [student_id],
    callback,
  );
};

exports.getBookingsByFaculty = (faculty_id, callback) => {
  db.query(
    `SELECT bookings.*, slots.slot_date, slots.start_time, slots.end_time, users.name AS student_name
     FROM bookings
     JOIN slots ON bookings.slot_id = slots.id
     JOIN users ON bookings.student_id = users.id
     WHERE bookings.faculty_id = ?
     ORDER BY slots.slot_date, slots.start_time`,
    [faculty_id],
    callback,
  );
};

exports.updateBookingStatus = (id, status, callback) => {
  db.query(
    "UPDATE bookings SET status = ? WHERE id = ?",
    [status, id],
    callback,
  );
};

exports.getAllBookings = (callback) => {
  db.query(
    `SELECT bookings.*, slots.slot_date, slots.start_time, slots.end_time,
            s.name AS student_name, f.name AS faculty_name
     FROM bookings
     JOIN slots ON bookings.slot_id = slots.id
     JOIN users AS s ON bookings.student_id = s.id
     JOIN users AS f ON bookings.faculty_id = f.id
     ORDER BY bookings.created_at DESC`,
    callback,
  );
};
