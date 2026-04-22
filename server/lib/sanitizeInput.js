/**
 * Обрезка и очистка пользовательского текста для хранения в БД / JSON.
 * Не заменяет экранирование при выводе в HTML (это делает клиент).
 */
function sanitizeText(value, maxLen) {
  let s = String(value ?? "")
    .replace(/\u0000/g, "")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
  if (maxLen && s.length > maxLen) {
    s = s.slice(0, maxLen);
  }
  return s.replace(/[<>]/g, "");
}

module.exports = { sanitizeText };
