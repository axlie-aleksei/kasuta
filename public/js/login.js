const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// Регулярные выражения для валидации
const emailReg = /^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/;
const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,32}$/;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Валидация email и пароля
  if (!emailReg.test(email) || !passwordReg.test(password)) {
    alert("Ошибка валидации! Проверьте правильность email и пароля.");
    console.log("Validation failed");
    return;
  }

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    // Если сервер отвечает перенаправлением (редиректом)
    if (response.redirected) {
      window.location.href = response.url;
      return;
    }

    const result = await response.json();

    if (response.ok) {
      window.location.href = "/index.html";
      return;
    } else {
      // Ошибка от сервера, например неправильный пароль или пользователь не найден
      alert(result.message || "Ошибка входа");
      console.error(result.message);
    }
  } catch (error) {
    console.error("Ошибка сети или сервера:", error);
    alert("Ошибка сервера, попробуйте позже.");
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
  const showIcon = btn.querySelector(".tm-pass__icon--show");
  const hideIcon = btn.querySelector(".tm-pass__icon--hide");
  if (showIcon && hideIcon) {
    showIcon.style.display = isPassword ? "none" : "";
    hideIcon.style.display = isPassword ? "" : "none";
  }
});
