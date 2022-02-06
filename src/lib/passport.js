const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const pool = require('../database');
//  const helpers = require('./helpers');

passport.use('local.signup', new LocalStrategy({
    usernameField: 'cred_admin',
    passwordField: 'contr_admin',
    passReqToCallback: true
}, async(req, username, password, done) => {
    let cedula = req.body.cedula;
    let nombres = req.body.nombresu;
    let apellidos = req.body.apellidosu;
    let correo = req.body.correou;
    password = await helpers.encryptPassword(password)
    const newUser = {
        cedula,
        nombres,
        apellidos,
        username,
        password,
        correo
    }
    const iu = await pool.query('INSERT INTO usuarios SET ?', [newUser]);
    newUser.id_usuario = iu.insertId;
    return done(null, newUser);
}));


passport.use('local.signin', new LocalStrategy({
    usernameField: 'cred_admin',
    passwordField: 'contr_admin',
    passReqToCallback: true
}, async(req, cred_admin, contr_admin, done) => {
    console.log(req.body);
    const idu = 1;
    const user = {
        idu,
        cred_admin,
        contr_admin
    };
    if (cred_admin == 'Administrador'){
        if (contr_admin == 'contraadmin'){
            console.log('Ud se ha logueado correctamente!');
            done(null, user)
        }else{
            done(null, false);
            console.log('Contraseña incorrecta')
        }
    }
    /*
    if (datosUsuario.length>0){
        console.log('Si hay datos de usuario')
        const user = datosUsuario[0];
        console.log('Datos del usuario: ');
        console.log(datosUsuario);
        const val = await helpers.matchPassword(password, user.password);
        console.log(password);
        console.log(user.password)
        if (val){
            console.log('Ud se ha logueado correctamente!');
            done(null, user, req.flash('success', 'Ud se ha logueado correctamente!'))
        }else{
            done(null, false, req.flash('message', 'Contraseña incorrecta'));
            console.log('Contraseña incorrecta')
        }
    }else{
        console.log('Nombre de usuario incorrecto');
        return done(null, false, req.flash('message', 'Nombre de usuario incorrecto'));
    }
    */
}));


passport.serializeUser((user, done) => {
    console.log('Este es el usuario: ' + user);
    done(null, user.idu);
});


passport.deserializeUser(async(id, done) =>{
    //const rows = await pool.query('SELECT * FROM usuarios WHERE id_usuario = ?', [id]);
    let cred_admin = 'Administrador';
    let contr_admin = 'contraadmin';
    user = {
        id,
        cred_admin,
        contr_admin
    };
    done(null, user);
});