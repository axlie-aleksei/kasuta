const form = document.getElementById("registerForm");

function togglePasswordIcons(btn, plaintextVisible) {
  const showIcon = btn.querySelector(".site-pass__icon--show");
  const hideIcon = btn.querySelector(".site-pass__icon--hide");
  if (showIcon && hideIcon) {
    showIcon.classList.toggle("is-hidden", plaintextVisible);
    hideIcon.classList.toggle("is-hidden", !plaintextVisible);
  }
}

function togglePassword(btn) {
  const selector = btn.getAttribute("data-target");
  const input = selector ? document.querySelector(selector) : null;
  if (!input) return;
  const isPassword = input.type === "password";
  input.type = isPassword ? "text" : "password";

  btn.setAttribute("aria-pressed", String(isPassword));
  togglePasswordIcons(btn, input.type === "text");
}

document.addEventListener("click", (e) => {
  const t = e.target;
  if (!t) return;
  const btn = t.closest && t.closest("[data-action='toggle-password']");
  if (!btn) return;
  e.preventDefault();
  togglePassword(btn);
});

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const fullname = form.querySelector("input[name='fullname']").value.trim();
  const email = form.querySelector("input[name='email']").value.trim();
  const password = form.querySelector("input[name='password']").value;
  const confirm = form.querySelector("input[name='confirm']").value;
  const city = form.querySelector("input[name='city']").value.trim();

  if (password !== confirm) {
    alert("Пароли не совпадают");
    return;
  }

  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fullname,
      email,
      pass: password,
      city
    }),
    credentials: "include"
  });

  const data = await res.json();

  if (data.success) {
    window.location.href = "/login.html";
  } else {
    alert(data.error || data.message || "Ошибка регистрации");
    console.error("Register error:", data);
  }

});
