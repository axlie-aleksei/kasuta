const form = document.getElementById("loginForm");
const mail = document.getElementById("email")
const password = document.getElementById("password")

const emailReg = /^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/
const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,32}$/

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  if(emailReg.test(mail.value) && passwordReg.test(password.value)) {
    try {
      const email = mail.value;
      const passwordValue = password.value; // уникальное имя
      const response = await fetch("http://127.0.0.1:3000/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password: passwordValue}),
      });

      const result = await response.json();
      console.log(result);

      if(result.redirected){
        window.location.href = result.url;
      }

      // if (result.message === "login edukas") {
      //   alert("Вход успешен! Сейчас вас перенаправят на главную");
      //   window.location.href = "/index.html";
      // } else {
      //   alert(result.message);
      // }
      // if (result.message === "vale parool") {
      //   alert("vale parool");
      //   console.error(error)
      // }
    } catch (error) {
      // console.error(error);
      // alert("Ошибка сервера");
    }
  }
  // }else {
  //   alert("Ошибка валидации! Проверьте поля формы.")
  //   console.log("validation failed");
  // }
});
