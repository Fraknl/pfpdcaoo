const bcrypt = require('bcryptjs');
const passport = require('passport');
const helpers = {};

helpers.encryptPassword = async(password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash
};

helpers.matchPassword = async(password, savedPassword) => {
    const valor = await bcrypt.compare(password, savedPassword);
    console.log('Esto es el resultado: ');
    console.log(valor);
    return valor
};

module.exports = helpers;