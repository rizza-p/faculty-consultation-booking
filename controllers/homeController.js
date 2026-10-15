// controllers/homeController.js
exports.showHome = (req, res) => {
  res.render("index", { title: "Faculty Consultation Booking System" });
};
