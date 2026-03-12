require("dotenv").config({ path: __dirname + "/../.env", quiet: true });

const path = require("path");
const express = require('express');
const session = require('express-session');

const helmet = require("helmet");
const rateLimit = require("express-rate-limit")

const limiter = rateLimit({

  windowMs:15*60*1000,
  max:100

})


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

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
    },
  },
}));
app.use(limiter);

// Статика public (js, css) — абсолютный путь, чтобы работало при любом cwd
app.use(express.static(path.join(__dirname, "..", "public")));

staticFiles(app);

const userRoutes = require("./routes/user");

app.use("/api/user", userRoutes);

const itemsRoutes = require("./routes/items");

app.use("/api/items", itemsRoutes);

const PORT = process.env.PORT || 3000;

console.log("PORT from env:", process.env.PORT);

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
