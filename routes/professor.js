const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  createAvailability,
  getProfessorAvailability,
  getProfessorAppointments,
} = require("../controllers/professor");

const router = express.Router();

router.post( "/availability", protect,authorize("professor"),createAvailability)
router.get("/availability", protect,  authorize("professor"),  getProfessorAvailability);
router.get(  "/appointments",  protect,  authorize("professor"),  getProfessorAppointments);

module.exports = router;
