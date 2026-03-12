const express = require("express");
const router = express.Router();
const pool = require("../db");
const { nameReg, emailReg, linnReg } = require("../validators/authValidators");

router.get("/profile", (req, res) => {

  if (!req.session.user) {
    return res.status(401).json({
      error: "Not authorized"
    });
  }

  const userId = req.session.user.id;

  const sql = `
    SELECT fullname, email, city, avatar
    FROM users
    WHERE id = ?
  `;
  pool.execute(sql, [userId], (err, result) => {

    if (err) {
      return res.status(500).json({
        error: "Database error"
      });
    }

    res.json(result[0]);

  });

});

function updateProfileHandler(req, res) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authorized" });
  }

  const { fullname, email, city } = req.body;
  const userId = req.session.user.id;

  if (!fullname || !email || !city ||
      !nameReg.test(fullname) ||
      !emailReg.test(email) ||
      !linnReg.test(city)
  ) {
    return res.status(400).json({ error: "Invalid or missing fields" });
  }

  pool.execute(
    "SELECT id FROM users WHERE email = ? AND id != ?",
    [email, userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      if (rows.length > 0) {
        return res.status(409).json({ error: "Email already in use" });
      }

      pool.execute(
        "UPDATE users SET fullname = ?, email = ?, city = ? WHERE id = ?",
        [fullname, email, city, userId],
        (err) => {
          if (err) {
            return res.status(500).json({ error: "Database error" });
          }
          res.json({ success: true });
        }
      );
    }
  );
}

router.put("/profile", updateProfileHandler);
router.post("/profile/update", updateProfileHandler);

const upload = require("../middleware/avatarUpload");

router.post(
  "/upload-avatar",
  (req, res, next) => {
    upload.single("avatar")(req, res, (err) => {
      if (err) {
        console.error("Upload avatar error:", err);
        return res.status(400).json({ error: err.message || "Upload failed" });
      }
      next();
    });
  },
  (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ error: "Not authorized" });
      }

      if (!req.file || !req.file.filename) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const filename = req.file.filename;
      const sql = "UPDATE users SET avatar=? WHERE id=?";

      pool.execute(
        sql,
        [filename, req.session.user.id],
        (err) => {
          if (err) {
            console.error("Upload avatar DB error:", err.code, err.message);
            return res.status(500).json({
              error: "DB error",
              details: err.message
            });
          }
          res.json({ success: true, avatar: filename });
        }
      );
    } catch (e) {
      console.error("Upload avatar unexpected error:", e);
      res.status(500).json({ error: "Server error", details: e.message });
    }
  }
);
module.exports = router;
