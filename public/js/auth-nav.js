(function () {
  fetch("/api/user/profile", { credentials: "include" })
    .then(function (res) {
      if (res.ok) {
        document.querySelectorAll(".nav-profile").forEach(function (el) {
          el.style.display = "";
        });
        document.querySelectorAll(".nav-login").forEach(function (el) {
          el.style.display = "none";
        });
        document.querySelectorAll(".nav-logout").forEach(function (el) {
          el.style.display = "";
        });
        document.querySelectorAll(".nav-auth").forEach(function (el) {
          el.style.display = "";
        });
      }
    })
    .catch(function () {});

  document.addEventListener("click", function (e) {
    var btn = e.target && e.target.closest ? e.target.closest("[data-action='logout']") : null;
    if (!btn) return;
    e.preventDefault();

    fetch("/api/auth/logout", { method: "POST", credentials: "include" })
      .then(function () {
        window.location.href = "/index.html";
      })
      .catch(function () {
        window.location.href = "/index.html";
      });
  });
})();
