// models/bookingModel.js
const db = require("../config/db");

// puts a slot back to open, using the slot that the booking belonged to
const reopenSlotForBooking = (booking_id, callback) => {
  db.query(
    "UPDATE slots SET is_booked = FALSE WHERE id = (SELECT slot_id FROM bookings WHERE id = ?)",
    [booking_id],
    callback,
  );
};

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

// faculty changes a booking status; declined or cancelled bookings reopen the slot
exports.updateBookingStatusForFaculty = (id, faculty_id, status, callback) => {
  db.query(
    "UPDATE bookings SET status = ? WHERE id = ? AND faculty_id = ?",
    [status, id, faculty_id],
    (err, result) => {
      if (err) return callback(err);
      if (result.affectedRows === 0) return callback(null, result);
      if (status === "declined" || status === "cancelled") {
        return reopenSlotForBooking(id, (err2) => callback(err2, result));
      }
      callback(null, result);
    },
  );
};

// student cancels their own booking; the slot reopens
exports.cancelBookingForStudent = (id, student_id, callback) => {
  db.query(
    "UPDATE bookings SET status = 'cancelled' WHERE id = ? AND student_id = ? AND status IN ('pending', 'approved')",
    [id, student_id],
    (err, result) => {
      if (err) return callback(err);
      if (result.affectedRows === 0) return callback(null, result);
      reopenSlotForBooking(id, (err2) => callback(err2, result));
    },
  );
};

// faculty cancels the whole slot; the slot stays closed on purpose
exports.cancelActiveBookingsBySlot = (slot_id, faculty_id, callback) => {
  db.query(
    "UPDATE bookings SET status = 'cancelled' WHERE slot_id = ? AND faculty_id = ? AND status IN ('pending', 'approved')",
    [slot_id, faculty_id],
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