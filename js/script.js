
const form = document.getElementById("registrationForm");
const nimi = document.getElementById("firstname")
const perenimi = document.getElementById("lastname")
const mail = document.getElementById("email")
const password = document.getElementById("password")
const phone = document.getElementById("phone")
const description = document.getElementById("description")
const checkbox = document.getElementById("agree")

const emailReg = /^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/
const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,32}$/
const phoneReg = /^[+]?[0-9]{7,15}$/;
const nameReg = /^[a-zA-Z]+$/
const lastnameReg = /^[a-zA-Z]+$/
const descriptionReg = /^[A-Za-z0-9.-]+$/

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  if (nameReg.test(nimi.value) && passwordReg.test(password.value)
    && phoneReg.test(phone.value) && emailReg.test(mail.value)
    && lastnameReg.test(perenimi.value) && descriptionReg.test(description.value) && checkbox.checked === true) {
    const name = nimi.value
    const email = mail.value
    const pass = password.value
    const phon = phone.value
    const pere = perenimi.value
    const descr = description.value
    const response = await fetch("http://127.0.0.1:3000/reg",{
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({name, email, pass, phon, pere})
    })
    try {
      const name = nimi.value;
      const email = mail.value;
      const pass = password.value;
      const phon = phone.value;
      const pere = perenimi.value;
      const descr = description.value;

      const response = await fetch("http://127.0.0.1:3000/reg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, pass, phon, pere }),
      });

      const result = await response.json();

      if (result.message === "registreerimi onnestus") {
        alert("Регистрация успешна! Сейчас вас перенаправят на главную");
        window.location.href = "/index.html";
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Ошибка сервера");
    }
  } else {
    alert("Ошибка валидации! Проверьте поля формы.");
    console.log("validation failed");
  }
});
