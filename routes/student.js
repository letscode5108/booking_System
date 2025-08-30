const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  getProfessorAvailability,
  getProfessors,
  getStudentAppointments,} = require("../controllers/student");

const router = express.Router();


router.get( "/professors/:professorId/availability",  protect,  authorize("student"),  getProfessorAvailability);
router.get("/professors", protect, authorize("student"), getProfessors);
router.get( "/appointments", protect, authorize("student"), getStudentAppointments);

module.exports = router;
