const pool = require("../db");
const bcrypt = require('bcrypt');

const {
  emailReg,
  passwordReg,
  nameReg,
  linnReg
} = require("../validators/authValidators");


exports.login = (req, res) => {
  const { email, password } = req.body;

  if(!passwordReg.test(password)) {
    return res.status(400).json({ message: "Password format invalid" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";

  pool.execute(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if(results.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = results[0];

    try{
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(401).json({ message: "Incorrect password" });
      }

      req.session.user = {
        id: user.id,
        email: user.email,
        name: user.name,
      };

      console.log("user logged in", user.eesnimi);

      res.json({ success: true});

    }catch (error){
      console.log("password comparison error:", error);

      res.status(500).json({ message: "Server error" });
    }
  });

};

exports.register = async (req, res) => {
  const { fullname, email, pass, linn } = req.body;

  if (!fullname || !email || !pass || !linn ||
    !nameReg.test(fullname) ||
    !emailReg.test(email) ||
    !passwordReg.test(pass) ||
    !linnReg.test(linn)
  ){
    return res.status(401).json({ message: "Incorrect input or missing fields" });
  }

  try {

    const hashpass = await bcrypt.hash(pass, 10);

    const sql ='INSERT INTO user (fullname, email, password, linn) VALUES (?,?,?,?)';

    pool.execute(sql, [fullname, email, hashpass, linn], (err) => {

      if(err){
        if (err.code === "ERR_DUP_ENTRY") {
          return res.status(409).json({ message: "email already in use" });
        }

        return res.status(500).json({ message: "server error" });

      }

      res.json({ success: true });

    });

  } catch (error) {
    console.error("hashing or DB error:", error);

    res.status(500).json({ message: "server error" });
  }
};
