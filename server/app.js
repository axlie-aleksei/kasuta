require("dotenv").config({ path: __dirname + "/../.env", quiet: true });

const path = require("path");
const express = require('express');
const session = require('express-session');

const cors = require("cors")

const helmet = require("helmet");
const rateLimit = require("express-rate-limit")
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { error: "too many login attempts" }
})

const authRoutes = require('./routes/auth');
const staticFiles = require("./middleware/staticFiles");

const app = express();

app.use(helmet.noSniff({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'",
        "http://localhost:3000",
        "https://cdn.jsdelivr.net"
      ],
      styleSrc: ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
    },
  },
}));
app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}))

app.use(express.urlencoded({ extended: true, limit: "10kb" }))

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
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

app.set("trust proxy", 1)

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}))

app.use("/api/auth/login", loginLimiter)

app.use(express.json({ limit: "10kb" }))

app.use("/api/auth", authRoutes);

// Статика public (js, css) — абсолютный путь, чтобы работало при любом cwd
app.use(express.static(path.join(__dirname, "..", "public")));

staticFiles(app);

const userRoutes = require("./routes/user");

app.use("/api/user", userRoutes);

const itemsRoutes = require("./routes/items");

app.use("/api/items", itemsRoutes);

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: "server error" })
})

app.use((req, res) => {

  // если API
  if (req.originalUrl.startsWith("/api")) {
    return res.status(404).json({ error: "not found" })
  }

  // если сайт
  res.status(404).sendFile(
    path.join(__dirname, "..", "views", "404.html")
  )

})

const PORT = process.env.PORT || 3000;

console.log("PORT from env:", process.env.PORT);

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
