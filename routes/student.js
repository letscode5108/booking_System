const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const Availability = require("../models/Availability");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const router = express.Router();



router.get(
  "/professors/:professorId/availability",
  protect,
  authorize("student"),
  async (req, res) => {
    try {
      const { professorId } = req.params;

      // Verify professor exists
      const professor = await User.findById(professorId);
      if (!professor || professor.role !== "professor") {
        return res.status(404).json({ message: "Professor not found" });
      }

      // Get available  slots for the professor
      const availability = await Availability.find({
        professor: professorId,
        isBooked: false,
        startTime: { $gt: new Date() }, 
      })
        .populate("professor", "name email department")
        .sort({ startTime: 1 });

      res.json({
        message: "Available slots fetched successfully",
        availability,
      });
    } catch (error) {
      console.error("Get professor availability error:", error);
      res.status(500).json({ message: "Server error fetching availability" });
    }
  }
);


router.get("/professors", protect, authorize("student"), async (req, res) => {
  try {
    const professors = await User.find({ role: "professor" })
      .select("name email department")
      .sort({ name: 1 });

    res.json({
      message: "Professors fetched successfully",
      professors,
    });
  } catch (error) {
    console.error("Get professors error:", error);
    res.status(500).json({ message: "Server error fetching professors" });
  }
});


router.get("/appointments", protect, authorize("student"), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { student: req.user._id };

    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate("professor", "name email department")
      .populate("availability")
      .sort({ startTime: 1 });

    res.json({
      message: "Appointments fetched successfully",
      appointments,
    });
  } catch (error) {
    console.error("Get student appointments error:", error);
    res.status(500).json({ message: "Server error fetching appointments" });
  }
});

module.exports = router;
