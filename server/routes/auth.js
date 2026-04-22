const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const authController = require("../controllers/authController");

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: { error: "too many registration attempts" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", authController.login);
router.post("/register", registerLimiter, authController.register);
router.post("/logout", authController.logout);

module.exports = router;
