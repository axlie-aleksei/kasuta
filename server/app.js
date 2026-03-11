require("dotenv").config({ path: __dirname + "/../.env" });

const express = require('express');
const session = require('express-session');

const authRoutes = require('./routes/auth');
const staticFiles = require("./middleware/staticFiles");

const app = express();

// -----------------
// Настройка сессий
// -----------------
app.use(session({
  name: "rent_session",

  secret: process.env.SESSION_SECRET,

  resave: false,
  saveUninitialized: false,

  cookie: {
    httpOnly: true,
    secure: false, // true только если https
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 деней
  }
}));

app.use("/api/auth", authRoutes);

staticFiles(app);

const PORT = process.env.PORT || 3000;

console.log("PORT from env:", process.env.PORT);

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
