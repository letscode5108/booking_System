const express = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/auth");
const {
  bookAppointment,
  cancelAppointment,
  getAppointment,
} = require("../controllers/appointment");

const router = express.Router();


router.post("/book", protect, bookAppointment);
router.put("/:appointmentId/cancel", protect, cancelAppointment);
router.get("/:appointmentId", protect, getAppointment);

module.exports = router;
