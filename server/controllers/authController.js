const pool = require("../db");
const bcrypt = require("bcrypt");
const {
  emailReg,
  passwordReg,
  nameReg,
  cityReg,
} = require("../validators/authValidators");
const { isProduction, cookieSecure, cookieSameSite } = require("../config/security");

const genericAuthFail = { message: "Invalid email or password" };

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Invalid email or password" });
  }
  const emailTrim = email.trim();
  if (!emailReg.test(emailTrim) || !passwordReg.test(password)) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";

  pool.execute(sql, [emailTrim], async (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });

    const fail = () =>
      res.status(401).json(isProduction ? genericAuthFail : { message: "User not found or wrong password" });

    if (results.length === 0) {
      return fail();
    }

    const user = results[0];

    try {
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        if (isProduction) {
          return res.status(401).json(genericAuthFail);
        }
        return res.status(401).json({ message: "Incorrect password" });
      }

      req.session.regenerate((regErr) => {
        if (regErr) {
          console.error("session regenerate error:", regErr);
          return res.status(500).json({ message: "Server error" });
        }
        req.session.user = {
          id: user.id,
          email: user.email,
          name: user.fullname,
        };
        if (!isProduction) {
          console.log("user logged in", user.email);
        }
        res.json({ success: true });
      });
    } catch (error) {
      console.error("password comparison error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
};

exports.register = async (req, res) => {
  const { fullname, email, pass, city } = req.body;

  if (
    !fullname ||
    !email ||
    !pass ||
    !city ||
    !nameReg.test(fullname) ||
    !emailReg.test(email) ||
    !passwordReg.test(pass) ||
    !cityReg.test(city)
  ) {
    return res.status(400).json({ message: "Incorrect input or missing fields" });
  }

  try {
    const hashpass = await bcrypt.hash(pass, isProduction ? 12 : 10);

    const sql =
      "INSERT INTO users (fullname, email, password, city) VALUES (?,?,?,?)";

    pool.execute(sql, [fullname, email, hashpass, city], (err) => {
      if (err) {
        console.error("Register DB error:", err.code, err.message);
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ message: "email already in use" });
        }
        if (isProduction) {
          return res.status(500).json({ message: "server error" });
        }
        return res.status(500).json({
          message: "server error",
          error: err.message,
        });
      }

      res.json({ success: true });
    });
  } catch (error) {
    console.error("Register hashing error:", error);
    if (isProduction) {
      return res.status(500).json({ message: "server error" });
    }
    return res.status(500).json({
      message: "server error",
      error: error.message,
    });
  }
};

exports.logout = (req, res) => {
  const clearOpts = {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: cookieSameSite(),
    path: "/",
  };
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Server error" });
      }
      res.clearCookie("kasuta_session", clearOpts);
      res.json({ success: true });
    });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};
