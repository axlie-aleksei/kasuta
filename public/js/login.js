const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const emailReg = /^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/;
const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,32}$/;

function toggleLoginPasswordIcons(btn, plaintextVisible) {
  const showIcon = btn.querySelector(".site-pass__icon--show");
  const hideIcon = btn.querySelector(".site-pass__icon--hide");
  if (showIcon && hideIcon) {
    showIcon.classList.toggle("is-hidden", plaintextVisible);
    hideIcon.classList.toggle("is-hidden", !plaintextVisible);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!emailReg.test(email) || !passwordReg.test(password)) {
    alert("Проверьте формат email и пароля (8–32 символа, латиница, заглавная, строчная, цифра).");
    return;
  }

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    if (response.redirected) {
      window.location.href = response.url;
      return;
    }

    const result = await response.json();

    if (response.ok) {
      window.location.href = "/index.html";
      return;
    } else {
      alert(result.message || "Ошибка входа");
    }
  } catch (error) {
    console.error(error);
    alert("Ошибка сети или сервера.");
  }
});

document.addEventListener("click", (e) => {
  const t = e.target;
  if (!t) return;
  const btn = t.closest && t.closest("[data-action='toggle-password']");
  if (!btn) return;
  e.preventDefault();
  if (!passwordInput) return;
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  btn.setAttribute("aria-pressed", String(isPassword));
  toggleLoginPasswordIcons(btn, passwordInput.type === "text");
});
