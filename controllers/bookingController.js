// controllers/bookingController.js
const slotModel = require("../models/slotModel");
const bookingModel = require("../models/bookingModel");

exports.bookSlot = (req, res) => {
  const slot_id = req.params.id;
  const { purpose } = req.body;
  const student_id = req.session.user.id;

  slotModel.getSlotById(slot_id, (err, results) => {
    if (err || results.length === 0) {
      return res.send("Slot not found.");
    }

    const slot = results[0];

    if (slot.is_booked) {
      return res.send("Sorry, this slot was just booked by someone else.");
    }

    bookingModel.createBooking(
      { slot_id, student_id, faculty_id: slot.faculty_id, purpose },
      (err) => {
        if (err) {
          console.error(err);
          return res.send("Could not create booking.");
        }

        slotModel.markSlotBooked(slot_id, (err) => {
          if (err) console.error(err);
          res.redirect("/my-bookings");
        });
      },
    );
  });
};

exports.myBookings = (req, res) => {
  const student_id = req.session.user.id;
  bookingModel.getBookingsByStudent(student_id, (err, results) => {
    if (err) {
      console.error(err);
      return res.send("Could not load bookings.");
    }
    res.render("myBookings", { bookings: results });
  });
};

exports.facultyBookings = (req, res) => {
  const faculty_id = req.session.user.id;
  bookingModel.getBookingsByFaculty(faculty_id, (err, results) => {
    if (err) {
      console.error(err);
      return res.send("Could not load bookings.");
    }
    res.render("facultyBookings", { bookings: results });
  });
};

exports.updateStatus = (req, res) => {
  const booking_id = req.params.id;
  const { status } = req.body;
  const faculty_id = req.session.user.id;

  const allowedStatuses = ["approved", "declined", "done", "cancelled"];
  if (!allowedStatuses.includes(status)) {
    return res.send("Invalid status.");
  }

  bookingModel.updateBookingStatusForFaculty(booking_id, faculty_id, status, (err, result) => {
    if (err) {
      console.error(err);
      return res.send("Could not update booking.");
    }
    if (result.affectedRows === 0) {
      return res.send("Booking not found or does not belong to you.");
    }
    res.redirect("/faculty-bookings");
  });
};

exports.cancelBooking = (req, res) => {
  const booking_id = req.params.id;
  const student_id = req.session.user.id;

  bookingModel.cancelBookingForStudent(booking_id, student_id, (err, result) => {
    if (err) {
      console.error(err);
      return res.send("Could not cancel booking.");
    }
    if (result.affectedRows === 0) {
      return res.send("Booking not found, not yours, or can no longer be cancelled.");
    }
    res.redirect("/my-bookings");
  });
};