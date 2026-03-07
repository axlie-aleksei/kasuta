let htp = require('http');
// http.createServer(function (req, res) {
//   res.writeHead(200, {'Content-Type': 'text/html'});
//   res.end('Hello World!');
// })

const bcrypt = require('bcrypt');

const express = require('express');

const path = require('path');

const app = express();

const { v4: genuuid } = require('uuid');

const session = require('express-session');

app.listen(3000, () => {
  console.log("Listening on http://127.0.0.1:3000");})

app.use(session(
  { name:'SessionCookie',
    genid: function(req) {
      console.log('session id created');
      return genuuid();},
    secret: 'Shsh!Secret!',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false,expires:60000 }
  }));
app.use(express.static(path.join(__dirname, '..')));

app.get('/index.html', (req, res) => {
  res.sendFile('C:\\Users\\opilane\\WebstormProjects\\portfolio\\index.html');
})

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

let mysql = require('mysql2');
const {hash} = require("bcrypt");

let con = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  database: "test",
});

 con.connect(function(err) {
   if (err) {
     console.error(err);
   }
   console.log("Connected!");
 });

const hostname = '127.0.0.1';
const port = 3000


app.post('/login', (req, res) => {
  const {email, password} = req.body;
  const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,32}$/

  if (passwordReg.test(password)) {
    const sql = "SELECT * FROM user WHERE email = ?";

    con.execute(sql, [email], async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({message: "Serveri viga"});
      }

      if (results.length === 0) {
        return res.status(401).json({message: "Kasutaja ei leitud"});
      }

      const user = results[0];

      try {
        const match = await bcrypt.compare(password, user.password);
        if (match) {

          console.log("match", match);


          req.session.user = {
            id: user.id,
            name: user.eesnimi,
            email: user.email,
          };

          console.log(user.eesnimi);
          return res.redirect("/index.html");
        } else {

          console.log("login edukas");
          return res.status(401).json({message: "Vale parool"});

        }
      } catch (err) {

        console.log("dsadas")
        console.error(err);
        return res.status(500).json({message: "Serveri viga"});

      }

    });

  } else {
    return res.status(666).json({message: "regex not match"});
  }

});
  // if (!email || !password) {
  //   return res.json({message: "koik valjad on kohustuslikud"});
  // }

app.post('/reg', async (req, res) => {

  const { name, email, pass, phon, pere} = req.body;

  const emailReg = /^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/
  const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,32}$/
  const phoneReg = /^[+]?[0-9]{7,15}$/;
  const nameReg = /^[a-zA-Z]+$/
  const lastnameReg = /^[a-zA-Z]+$/

   if(emailReg.test(email)
     && passwordReg.test(pass)
     && phoneReg.test(phon)
     && lastnameReg.test(pere)
     && nameReg.test(name)){
    if (!name || !email || !pass || !phon || !pere) {
      return res.json({message: "koik valjad on kohustuslikud"});
    }

    try {
      const hash = await bcrypt.hash(pass, 10);

      const sql = "insert into user(eesnimi, perenimi, email, password, telefon) values (?,?,?,?,?)";
      con.execute(sql, [name, pere, email, hash, phon], err => {
        if (err) {
          if(err.code == "ER_DUP_ENTRY"){
            return res.json({message:"see email on juba kasutusel"});
          }
          return res.json({message:"serveri viga"});
        }
        return res.json({message:"registreerimi onnestus"});
      });
    }catch {
      return res.json({message:"serveri viga"});
    }
  }else{
    return res.status(666).json({ message: "regex not match" });
  }

})

