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
    const response = await fetch("http://127.0.0.1:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // Если сервер отвечает перенаправлением (редиректом)
    if (response.redirected) {
      window.location.href = response.url;
      return;
    }

    const result = await response.json();

    if (response.ok) {
      // Здесь можно обработать успешный логин (если не редирект)
      alert("Вход успешен!");
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
