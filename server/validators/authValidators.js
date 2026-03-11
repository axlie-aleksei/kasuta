// EMAIL
const emailReg = /^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/;

// PASSWORD
const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,32}$/;

// PHONE
const phoneReg = /^[+]?[0-9]{7,15}$/;

// FULL NAME (если одно поле)
const  nameReg = /^[a-zA-Z\s]{2,60}$/;

// CITY (linn)
const linnReg = /^[a-zA-Z\s]{2,50}$/;

module.exports = {
  emailReg,
  passwordReg,
  phoneReg,
  nameReg,
  linnReg
};
