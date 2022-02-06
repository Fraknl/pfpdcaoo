const express = require('express');
const router = express.Router();

const passport = require('passport');
const pool = require('../database');
//console.log(pool);
const nbd = pool.config.connectionConfig.database;
const {isLoggedIn} = require('../lib/seguro');


router.get('/Home', isLoggedIn , async(req, res) => {
	
	let tablas = await pool.query('SELECT table_name AS nombre FROM information_schema.tables WHERE table_schema = "' + nbd + '";'); 
	
	//console.log(tablas);
	let  cantidades = [];
	delete tablas[1];
	console.log('Estas son las tablas: ');
	for (const prop in tablas){
		console.log(prop)
	}
	const diccionario = ['gestionadas','', 'usadas', 'realizadas']
	for (const n in tablas){
		var cantidad = await pool.query('SELECT count(*) as c FROM ' + tablas[n].nombre + ';');
		tablas[n].cant = cantidad[0].c;
		console.log('La cantidad de ' + tablas[n].Tables_in_sistema_central + ' es ' + cantidad[0].c);
		tablas[n].dict = diccionario[n];	
	}
	
	res.render('Home_respaldo.hbs', {'menu': 'si', 'tablas': tablas}); 

});

router.post('/Home', (req, res, next) => {
	var username = req.body.cred_admin;
	var password = req.body.contr_admin;
	passport.authenticate('local.signin', {
		successRedirect: '/Home',
		failureRedirect: '/'
	})(req, res, next);
	/*
	if(username=='Administrador'){
		if(password=='contraadmin'){
			res.render('Home.hbs', {'menu': 'si'}); 
		};
	};*/
});

module.exports = router; 