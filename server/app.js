const bcrypt = require('bcrypt');
const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const session = require('express-session');
const { v4: genuuid } = require('uuid');

const app = express();

// -----------------
// Настройка базы данных
// -----------------
const con = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  database: "test",
});

con.connect(err => {
  if (err) return console.error("DB connection error:", err);
  console.log("Connected to MySQL database!");
});

// -----------------
// Настройка сессий
// -----------------
app.use(session({
  name: 'SessionCookie',
  genid: () => {
    console.log('Session ID created');
    return genuuid();
  },
  secret: 'Shsh!Secret!',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 60_000 } // 1 минута
}));

// -----------------
// Статические файлы и парсеры
// -----------------
app.use(express.static(path.join(__dirname, '..')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------
// Регулярные выражения для валидации
// -----------------
const emailReg = /^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/;
const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,32}$/;
const phoneReg = /^[+]?[0-9]{7,15}$/;
const nameReg = /^[a-zA-Z]+$/;
const lastnameReg = /^[a-zA-Z]+$/;

// -----------------
// Сервер
// -----------------
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://127.0.0.1:${PORT}`);
});

// -----------------
// Маршрут для главной страницы
// -----------------
app.get('/index.html', (req, res) => {
  res.sendFile('C:\\Users\\opilane\\WebstormProjects\\portfolio\\index.html');
});

// -----------------
// Авторизация пользователя
// -----------------
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!passwordReg.test(password)) {
    return res.status(400).json({ message: "Password format invalid" });
  }

  const sql = "SELECT * FROM user WHERE email = ?";
  con.execute(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (results.length === 0) return res.status(401).json({ message: "User not found" });

    const user = results[0];
    try {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        req.session.user = { id: user.id, name: user.eesnimi, email: user.email };
        console.log("User logged in:", user.eesnimi);
        return res.redirect("/index.html");
      } else {
        return res.status(401).json({ message: "Incorrect password" });
      }
    } catch (error) {
      console.error("Password comparison error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
});

// -----------------
// Регистрация пользователя
// -----------------
app.post('/reg', async (req, res) => {
  const { name, email, pass, phon, pere } = req.body;

  // Проверка обязательных полей и валидация
  if (
    !name || !email || !pass || !phon || !pere ||
    !nameReg.test(name) || !lastnameReg.test(pere) ||
    !emailReg.test(email) || !passwordReg.test(pass) || !phoneReg.test(phon)
  ) {
    return res.status(400).json({ message: "Invalid input or missing fields" });
  }

  try {
    const hashedPass = await bcrypt.hash(pass, 10);
    const sql = "INSERT INTO user (eesnimi, perenimi, email, password, telefon) VALUES (?, ?, ?, ?, ?)";
    con.execute(sql, [name, pere, email, hashedPass, phon], (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ message: "Email already in use" });
        }
        return res.status(500).json({ message: "Server error" });
      }
      return res.json({ message: "Registration successful" });
    });
  } catch (error) {
    console.error("Hashing or DB error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});
