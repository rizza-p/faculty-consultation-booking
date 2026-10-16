// controllers/slotController.js
const slotModel = require("../models/slotModel");
const bookingModel = require("../models/bookingModel");

exports.showSlotForm = (req, res) => {
  res.render("createSlot", { error: null });
};

exports.createSlot = (req, res) => {
  const { slot_date, start_time, end_time } = req.body;
  const faculty_id = req.session.user.id;

  slotModel.createSlot(
    { faculty_id, slot_date, start_time, end_time },
    (err) => {
      if (err) {
        console.error(err);
        return res.render("createSlot", { error: "Could not create slot." });
      }
      res.redirect("/dashboard");
    },
  );
};

exports.listAvailableSlots = (req, res) => {
  slotModel.getAvailableSlots((err, results) => {
    if (err) {
      console.error(err);
      return res.send("Could not load slots.");
    }
    res.render("availableSlots", { slots: results });
  });
};

exports.mySlots = (req, res) => {
  const faculty_id = req.session.user.id;
  slotModel.getSlotsWithBookingsByFaculty(faculty_id, (err, results) => {
    if (err) {
      console.error(err);
      return res.send("Could not load your slots.");
    }
    res.render("mySlots", { slots: results });
  });
};

exports.cancelSlot = (req, res) => {
  const slot_id = req.params.id;
  const faculty_id = req.session.user.id;

  slotModel.getSlotById(slot_id, (err, results) => {
    if (err || results.length === 0) {
      return res.send("Slot not found.");
    }

    const slot = results[0];

    if (Number(slot.faculty_id) !== Number(faculty_id)) {
      return res.send("This slot does not belong to you.");
    }

    // Open slot: remove it completely
    if (!slot.is_booked) {
      return slotModel.deleteOpenSlot(slot_id, faculty_id, (err) => {
        if (err) {
          console.error(err);
          return res.send("Could not remove slot.");
        }
        res.redirect("/my-slots");
      });
    }

    // Booked slot (emergency): cancel the booking on it, slot stays unavailable
    bookingModel.cancelActiveBookingsBySlot(slot_id, faculty_id, (err) => {
      if (err) {
        console.error(err);
        return res.send("Could not cancel slot.");
      }
      res.redirect("/my-slots");
    });
  });
};