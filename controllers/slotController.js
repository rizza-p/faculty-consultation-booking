// controllers/slotController.js
const slotModel = require("../models/slotModel");

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
