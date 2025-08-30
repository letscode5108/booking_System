const express = require("express");
const { body } = require("express-validator");
const { registerUser, loginUser } = require("../controllers/auth");
const router = express.Router();

// Validation middleware arrays
const registerValidation = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Name must be between 1 and 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .isIn(["student", "professor"])
    .withMessage("Role must be either student or professor"),
  body("department").custom((value, { req }) => {
    if (req.body.role === "professor" && !value) {
      throw new Error("Department is required for professors");
    }
    return true;
  }),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),
  body("password").exists().withMessage("Password is required"),
];

// Routes
router.post("/register", registerValidation, registerUser);
router.post("/login", loginValidation, loginUser);

module.exports = router;
