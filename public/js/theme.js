(function applyStoredTheme() {
  try {
    var stored = localStorage.getItem("kasuta-theme");
    var theme = stored === "light" || stored === "dark" ? stored : "dark";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();

var ICON_SUN =
  '<svg class="site-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
  '<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.6"/>' +
  '<path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
  "</svg>";

var ICON_MOON =
  '<svg class="site-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
  '<path d="M21 14.35A8.94 8.94 0 0 1 9.65 3 7 7 0 1 0 21 14.35z" stroke="currentColor" stroke-width="1.55" stroke-linejoin="round"/>' +
  "</svg>";

function kasutaGetTheme() {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function kasutaSetTheme(next) {
  if (next !== "light" && next !== "dark") next = "dark";
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem("kasuta-theme", next);
  } catch (e) {}
  var btn = document.getElementById("kasutaThemeToggle");
  if (btn) {
    var isDark = next === "dark";
    btn.setAttribute("aria-label", isDark ? "Включить светлую тему" : "Включить тёмную тему");
    btn.innerHTML = isDark ? ICON_SUN : ICON_MOON;
  }
}

function kasutaToggleTheme() {
  kasutaSetTheme(kasutaGetTheme() === "dark" ? "light" : "dark");
}

function kasutaMountThemeToggle() {
  if (document.getElementById("kasutaThemeToggle")) return;
  var cur = kasutaGetTheme();
  var btn = document.createElement("button");
  btn.type = "button";
  btn.id = "kasutaThemeToggle";
  btn.className = "site-icon-btn site-theme-toggle";
  btn.setAttribute("data-action", "theme-toggle");
  btn.setAttribute("aria-label", cur === "dark" ? "Включить светлую тему" : "Включить тёмную тему");
  btn.innerHTML = cur === "dark" ? ICON_SUN : ICON_MOON;

  var actions = document.querySelector(".site-nav__actions");
  if (actions) {
    actions.insertBefore(btn, actions.firstChild);
    return;
  }
  var navGlass = document.querySelector(".navbar-glass");
  if (navGlass) {
    navGlass.appendChild(btn);
  }
}

document.addEventListener("DOMContentLoaded", kasutaMountThemeToggle);

document.addEventListener("click", function (e) {
  var t = e.target && e.target.closest && e.target.closest("[data-action='theme-toggle']");
  if (t) {
    e.preventDefault();
    kasutaToggleTheme();
  }
});
