const { isProduction } = require("../config/security");

function sendServerError(res, err, logLabel) {
  if (err && logLabel) {
    console.error(logLabel, err.message || err);
  }
  if (isProduction) {
    return res.status(500).json({ error: "server error" });
  }
  return res.status(500).json({
    error: "server error",
    details: err && err.message ? err.message : undefined,
  });
}

module.exports = { sendServerError };
