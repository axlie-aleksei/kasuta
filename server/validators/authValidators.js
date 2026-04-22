const emailReg = /^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/;

const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,32}$/;

const phoneReg = /^[+]?[0-9]{7,15}$/;

const nameReg = /^[\p{L}\s\-']{2,60}$/u;

const cityReg = /^[a-zA-Z\sæøåÆØÅ\-]{2,50}$/u;

module.exports = {
  emailReg,
  passwordReg,
  phoneReg,
  nameReg,
  cityReg
};
