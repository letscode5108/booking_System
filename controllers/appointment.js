const { validationResult } = require("express-validator");
const Appointment = require("../models/Appointment");
const Availability = require("../models/Availability");
const User = require("../models/User");
const mongoose = require("mongoose");


const bookAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    if (req.user.role !== "student") {
      await session.abortTransaction();
      return res
        .status(403)
        .json({ message: "Only students can book appointments" });
    }

    const { availabilityId, notes } = req.body;

   
    const availability = await Availability.findById(availabilityId)
      .populate("professor", "name email department")
      .session(session);

    if (!availability) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Availability slot not found" });
    }

    //  already booked
    if (availability.isBooked) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "This time slot is already booked" });
    }
     


    // Create the appointment
    const appointment = await Appointment.create(
      [
        {
          student: req.user._id,
          professor: availability.professor._id,
          availability: availabilityId,
          startTime: availability.startTime,
          endTime: availability.endTime,
          notes: notes || "",
        },
      ],
      { session }
    );

    
    await Availability.findByIdAndUpdate(
      availabilityId,
      {
        isBooked: true,
        bookedBy: req.user._id,
      },
      { session }
    );

    await session.commitTransaction();

  
    const populatedAppointment = await Appointment.findById(appointment[0]._id)
      .populate("student", "name email")
      .populate("professor", "name email department")
      .populate("availability");

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: populatedAppointment,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Book appointment error:", error);
    res.status(500).json({ message: "Server error booking appointment" });
  } finally {
    session.endSession();
  }
};

// Cancel 
const cancelAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId)
      .populate("student", "name email")
      .populate("professor", "name email department")
      .session(session);
    
    if (req.user.role !== "professor") {
      await session.abortTransaction();
      return res
        .status(403)
        .json({ message: "Only professor can cancel appointments" });
    }

    if (!appointment) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Appointment not found" });
    }
         const isAuthorized =
      appointment.student._id.toString() === req.user._id.toString() ||
      appointment.professor._id.toString() === req.user._id.toString();

    if (!isAuthorized) {
      await session.abortTransaction();
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this appointment" });
    }


    if (appointment.status === "cancelled") {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Appointment is already cancelled" });
    }

    await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        status: "cancelled",
        cancelledBy: req.user._id,
        cancelledAt: new Date(),
      },
      { session }
    );

    await Availability.findByIdAndUpdate(
      appointment.availability,
      {
        isBooked: false,
        bookedBy: null,
      },
      { session }
    );

    await session.commitTransaction();

    const updatedAppointment = await Appointment.findById(appointmentId)
      .populate("student", "name email")
      .populate("professor", "name email department")
      .populate("cancelledBy", "name email role");

    res.json({
      message: "Appointment cancelled successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Cancel appointment error:", error);
    res.status(500).json({ message: "Server error cancelling appointment" });
  } finally {
    session.endSession();
  }
};

//  appointment details
const getAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId)
      .populate("student", "name email")
      .populate("professor", "name email department")
      .populate("availability")
      .populate("cancelledBy", "name email role");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const isAuthorized =
      appointment.student._id.toString() === req.user._id.toString() ||
      appointment.professor._id.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this appointment" });
    }

    res.json({
      message: "Appointment details fetched successfully",
      appointment,
    });
  } catch (error) {
    console.error("Get appointment error:", error);
    res.status(500).json({ message: "Server error fetching appointment" });
  }
};

module.exports = {
  bookAppointment,
  cancelAppointment,
  getAppointment,
};




















