const path = require("path");

const isProduction = process.env.NODE_ENV === "production";

const MIN_SESSION_SECRET_LENGTH = 32;

function getSessionSecret() {
  return process.env.SESSION_SECRET || "";
}

function assertProductionSecrets() {
  const secret = getSessionSecret();
  if (!isProduction) return;
  if (secret.length < MIN_SESSION_SECRET_LENGTH) {
    console.error(
      "[security] В production нужен SESSION_SECRET длиной не менее " +
        MIN_SESSION_SECRET_LENGTH +
        " символов. Задайте в .env и перезапустите."
    );
    process.exit(1);
  }
  if (!process.env.CORS_ORIGIN && !process.env.PUBLIC_ORIGIN) {
    console.warn(
      "[security] В production задайте CORS_ORIGIN или PUBLIC_ORIGIN (URL сайта), иначе запросы с Origin могут блокироваться CORS."
    );
  }
}

function getAllowedCorsOrigins() {
  const raw = process.env.CORS_ORIGIN || process.env.PUBLIC_ORIGIN || "";
  if (raw.trim()) {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (isProduction) {
    console.warn(
      "[security] CORS_ORIGIN или PUBLIC_ORIGIN не заданы — разрешён только same-origin (без Origin)."
    );
    return [];
  }
  return ["http://127.0.0.1:3000", "http://localhost:3000"];
}

function getCspConnectSrc() {
  const set = new Set(["'self'", "https://cdn.jsdelivr.net"]);
  for (const o of getAllowedCorsOrigins()) {
    if (o.startsWith("http://") || o.startsWith("https://")) {
      set.add(o);
    }
  }
  if (!isProduction) {
    set.add("http://localhost:3000");
    set.add("http://127.0.0.1:3000");
  }
  return Array.from(set);
}

/** img-src: без общего https: (ZAP). Доп. источники — через CSP_IMG_SRC= https://a.com,https://b.com */
function getCspImgSrc() {
  const set = new Set(["'self'", "data:", "blob:"]);
  const raw = process.env.CSP_IMG_SRC || "";
  for (const p of raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)) {
    set.add(p);
  }
  return Array.from(set);
}

function trustProxyEnabled() {
  if (process.env.TRUST_PROXY === "1") return true;
  if (process.env.TRUST_PROXY === "0") return false;
  return isProduction;
}

function cookieSameSite() {
  const v = (process.env.COOKIE_SAMESITE || "lax").toLowerCase();
  if (v === "strict" || v === "none" || v === "lax") return v;
  return "lax";
}

function cookieSecure() {
  if (process.env.COOKIE_SECURE === "1") return true;
  if (process.env.COOKIE_SECURE === "0") return false;
  if ((process.env.COOKIE_SAMESITE || "lax").toLowerCase() === "none") {
    return true;
  }
  return isProduction;
}

module.exports = {
  isProduction,
  MIN_SESSION_SECRET_LENGTH,
  getSessionSecret,
  assertProductionSecrets,
  getAllowedCorsOrigins,
  getCspConnectSrc,
  getCspImgSrc,
  trustProxyEnabled,
  cookieSameSite,
  cookieSecure,
  /** Абсолютный путь к каталогу views (защита staticFiles от path traversal) */
  viewsRoot: path.resolve(path.join(__dirname, "..", "..", "views")),
};
