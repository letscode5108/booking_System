const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    professor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Professor is required"],
      validate: {
        validator: async function (professorId) {
          const professor = await mongoose.model("User").findById(professorId);
          return professor && professor.role === "professor";
        },
        message: "Invalid professor ID",
      },
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
      validate: {
        validator: function (endTime) {
          return endTime > this.startTime;
        },
        message: "End time must be after start time",
      },
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
availabilitySchema.index({ professor: 1, startTime: 1 });
availabilitySchema.index({ professor: 1, isBooked: 1 });

module.exports = mongoose.model("Availability", availabilitySchema);

