const express = require("express");
const { body, validationResult } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const Availability = require("../models/Availability");
const Appointment = require("../models/Appointment");
const router = express.Router();

router.post(
  "/availability",
  [
    protect,
    authorize("professor"),
    body("startTime")
      .isISO8601()
      .withMessage("Start time must be a valid ISO 8601 date"),
    body("endTime")
      .isISO8601()
      .withMessage("End time must be a valid ISO 8601 date"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { startTime, endTime } = req.body;
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);

      // Validate dates
      if (startDate <= new Date()) {
        return res
          .status(400)
          .json({ message: "Start time must be in the future" });
      }

      if (endDate <= startDate) {
        return res
          .status(400)
          .json({ message: "End time must be after start time" });
      }

      // Check for overlapping availability
      const overlapping = await Availability.findOne({
        professor: req.user._id,
        $or: [{ startTime: { $lt: endDate }, endTime: { $gt: startDate } }],
      });

      if (overlapping) {
        return res
          .status(400)
          .json({ message: "Time slot overlaps with existing availability" });
      }

      const availability = await Availability.create({
        professor: req.user._id,
        startTime: startDate,
        endTime: endDate,
      });

      await availability.populate("professor", "name email department");

      res.status(201).json({
        message: "Availability created successfully",
        availability,
      });
    } catch (error) {
      console.error("Create availability error:", error);
      res.status(500).json({ message: "Server error creating availability" });
    }
  }
);

router.get(
  "/availability",
  protect,
  authorize("professor"),
  async (req, res) => {
    try {
      const availability = await Availability.find({
        professor: req.user._id,
      })
        .populate("bookedBy", "name email")
        .sort({ startTime: 1 });

      res.json({
        message: "Availability fetched successfully",
        availability,
      });
    } catch (error) {
      console.error("Get availability error:", error);
      res.status(500).json({ message: "Server error fetching availability" });
    }
  }
);

router.get(
  "/appointments",
  protect,
  authorize("professor"),
  async (req, res) => {
    try {
      const { status } = req.query;
      const filter = { professor: req.user._id };

      if (status) {
        filter.status = status;
      }

      const appointments = await Appointment.find(filter)
        .populate("student", "name email")
        .populate("availability")
        .sort({ startTime: 1 });

      res.json({
        message: "Appointments fetched successfully",
        appointments,
      });
    } catch (error) {
      console.error("Get appointments error:", error);
      res.status(500).json({ message: "Server error fetching appointments" });
    }
  }
);

module.exports = router;
