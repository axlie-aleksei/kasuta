const form = document.getElementById("registrationForm");
const firstNameInput = document.getElementById("firstname");
const lastNameInput = document.getElementById("lastname");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const phoneInput = document.getElementById("phone");
const descriptionInput = document.getElementById("description");
const agreeCheckbox = document.getElementById("agree");

// Регулярные выражения для валидации
const emailReg = /^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/;
const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,32}$/;
const phoneReg = /^[+]?[0-9]{7,15}$/;
const nameReg = /^[a-zA-Z]+$/;
const descriptionReg = /^[A-Za-z0-9 .-]+$/; // Разрешаем пробелы и точки

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Получаем значения и обрезаем пробелы
  const name = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const phone = phoneInput.value.trim();
  const description = descriptionInput.value.trim();
  const isAgreed = agreeCheckbox.checked;

  // Проверяем валидацию
  if (
    nameReg.test(name) &&
    nameReg.test(lastName) &&
    emailReg.test(email) &&
    passwordReg.test(password) &&
    phoneReg.test(phone) &&
    descriptionReg.test(description) &&
    isAgreed
  ) {
    try {
      const response = await fetch("http://127.0.0.1:3000/reg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          pere: lastName,  // backend ожидает pere
          email,
          pass: password,  // backend ожидает pass
          phon: phone      // backend ожидает phon
          // описание (description) не передаем, т.к. его в backend нет
        }),
      });

      const result = await response.json();

      if (result.message === "registreerimi onnestus") {
        alert("Регистрация успешна! Сейчас вас перенаправят на главную");
        window.location.href = "/index.html";
      } else {
        alert(result.message || "Ошибка при регистрации");
      }
    } catch (error) {
      console.error(error);
      alert("Ошибка сервера, попробуйте позже.");
    }
  } else {
    alert("Ошибка валидации! Проверьте поля формы.");
    console.log("Validation failed");
  }
});
