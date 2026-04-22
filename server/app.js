require("dotenv").config({ path: __dirname + "/../.env", quiet: true });

const path = require("path");
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const helmet = require("helmet");
const onHeaders = require("on-headers");
const rateLimit = require("express-rate-limit");

const {
  isProduction,
  assertProductionSecrets,
  getAllowedCorsOrigins,
  getCspConnectSrc,
  getCspImgSrc,
  trustProxyEnabled,
  cookieSameSite,
  cookieSecure,
  getSessionSecret,
  viewsRoot,
} = require("./config/security");

assertProductionSecrets();

const sessionSecret =
  getSessionSecret() ||
  (!isProduction
    ? "kasuta-development-session-secret-32chars!!"
    : "");

if (!getSessionSecret() && !isProduction) {
  console.warn(
    "[security] SESSION_SECRET не задан — используется встроенная dev-строка; для продакшена задайте длинный секрет в .env."
  );
}

const authRoutes = require("./routes/auth");
const staticFiles = require("./middleware/staticFiles");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", trustProxyEnabled() ? 1 : 0);

const cspDirectives = {
  defaultSrc: ["'self'"],
  baseUri: ["'self'"],
  connectSrc: getCspConnectSrc(),
  fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
  frameSrc: ["'none'"],
  imgSrc: getCspImgSrc(),
  manifestSrc: ["'none'"],
  mediaSrc: ["'self'"],
  objectSrc: ["'none'"],
  scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
  scriptSrcAttr: ["'none'"],
  styleSrc: ["'self'", "https://cdn.jsdelivr.net"],
  workerSrc: ["'none'"],
};

if (isProduction) {
  cspDirectives.upgradeInsecureRequests = [];
}

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: cspDirectives,
    },
    hsts: isProduction
      ? { maxAge: 31536000, includeSubDomains: true, preload: false }
      : false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    frameguard: { action: "deny" },
  })
);

app.use((req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()"
  );
  next();
});

app.use((req, res, next) => {
  onHeaders(res, () => {
    res.removeHeader("Server");
  });
  next();
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 80 : 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

app.use(express.urlencoded({ extended: true, limit: "10kb" }));

const allowedOrigins = getAllowedCorsOrigins();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.length === 0) {
        if (isProduction) {
          console.warn(
            "[security] CORS: запрос с Origin, но CORS_ORIGIN пуст — отклонено. Укажите публичный URL сайта."
          );
          return callback(null, false);
        }
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    optionsSuccessStatus: 204,
    maxAge: 86400,
  })
);

app.use(
  session({
    name: "kasuta_session",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: cookieSecure(),
      sameSite: cookieSameSite(),
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: "/",
    },
  })
);

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: isProduction ? 5 : 25,
  message: { error: "too many login attempts" },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

app.use(express.json({ limit: "10kb" }));

app.use("/api/auth/login", loginLimiter);

app.use("/api/auth", authRoutes);

app.use(express.static(path.join(__dirname, "..", "public")));

staticFiles(app);

const userRoutes = require("./routes/user");
app.use("/api/user", userRoutes);

const itemsRoutes = require("./routes/items");
app.use("/api/items", itemsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  if (isProduction) {
    return res.status(500).json({ error: "server error" });
  }
  res.status(500).json({ error: "server error", message: err.message });
});

app.use((req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(404).json({ error: "not found" });
  }
  res.status(404).sendFile(path.join(viewsRoot, "404.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} (${isProduction ? "production" : "development"})`);
});
