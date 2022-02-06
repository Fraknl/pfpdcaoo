const express = require('express');
const router = express.Router();
const pool = require('../database');
const { isLoggedIn } = require('../lib/seguro.js');
var Plotly = require('plotly')("DemoAccount", "lr1c37zw81");



router.get('/home/estaciones/informacion', async(req, res) => {
	const datosEstacion = await pool.query('SELECT * FROM estaciones;'); 
	res.render('Estaciones.hbs', {datosEstacion: datosEstacion, 'menu': 'si'}); 
});
 
router.get('/home/estaciones/agregar', (req, res) => {
	res.render('EstacionesAgregar.hbs', {'menu': 'si'}); 
});

router.post('/home/estaciones/agregar', async(req, res) => {
	var coe = req.body.codigo_estacion;
	var nes = req.body.nombre_estacion;
	var ubi = req.body.ubicacion;
	var tes = req.body.conectores;
	var ult_est = await pool.query ('SELECT id_estacion FROM estaciones ORDER BY id_estacion DESC LIMIT 1');
	console.log('Esta es la ultima estacion: ' + ult_est)

	if (ult_est.length==0){
		ult_est = 1;
	}else{
		ult_est = ult_est[0].id_estacion + 1;
	};
	console.log('Esta es la ultima estacion: ' + ult_est)
	var insert = 'INSERT INTO estaciones VALUES (?,?,?,?);';
	const subirEstacion = await pool.query(insert, [ult_est, coe, nes, tes]);
	console.log('Resultados de la consulta: ', insert);
	console.log(subirEstacion);
	res.render('EstacionesAgregar.hbs', {'menu': 'si'}); 
});

router.get('/home/estaciones/eliminar/:id', async(req, res) => {
	var ide = req.params.id;
	var delet = 'DELETE FROM estaciones ';
	var where = 'WHERE id_estacion="' + ide + '";';
	await pool.query(delet + where);
	res.redirect('/home/estaciones/informacion');
});

router.get('/home/estaciones/editar/:id', async(req, res) => {
	var ide = req.params.id;
	var select = 'SELECT * FROM estaciones ';
	var where = 'WHERE id_estacion="' + ide + '";';
	const datosEstacion = await pool.query(select + where);
	console.log(datosEstacion);
	res.render('EstacionesEditar.hbs', {datosEstacion: datosEstacion[0], 'menu': 'si'});
});


router.get('/home/estaciones/info/:id', async(req, res) => {
	var ide = req.params.id;
	let select = 'SELECT * FROM estaciones ';
	let where = 'WHERE id_estacion="' + ide + '";';
	const datosEstacion = await pool.query(select + where);
	console.log(datosEstacion);
	res.render('EstacionesInformacion.hbs', {datosEstacion: datosEstacion[0], 'menu': 'si', 'info': true});
});

router.get('/home/estaciones/transacciones/:id', async(req, res) => {
	var ide = req.params.id;
	let select = 'SELECT * FROM transacciones ';
	let where = 'WHERE id_estacion="' + ide + '";';
	const datosTransacciones = await pool.query(select + where);
	console.log(datosTransacciones);
	res.render('EstacionesInformacion.hbs', 
	{datosTransacciones: datosTransacciones, 'menu': 'si', 'transacciones': true, 'id_estacion': ide});
});

router.get('/home/estaciones/tiempoReal/:id', async(req, res) => {
	var ide = req.params.id;
	let select = 'SELECT * FROM conectores ';
	let where = 'WHERE id_estacion="' + ide + '";';
	const datosConectores = await pool.query(select + where);
	console.log(datosConectores);
	res.render('EstacionesInformacion.hbs', 
	{datosConectores: datosConectores, 'menu': 'si', 'tiempoReal': true, 'id_estacion': ide});
});


router.post('/home/estaciones/actualizar/:id', async(req, res) => {
	var id = req.params.id;
	var ide = req.body.idestacion
	var nes = req.body.nombreestacion;
	//var ubi = req.body.ubicacion;
	var tes = req.body.tipoestacion;
	var update = 'UPDATE estaciones ';
	var set = 'SET codigo_estacion="' + ide + '", nombre_estacion="' + nes + '", cant_conectores="' + tes + '"';
	var where = ' WHERE id_estacion="' + id + '";';
	var query = update + set + where;
	console.log(query); 
	await pool.query(query);
    res.redirect('/home/estaciones/informacion'); 
});

router.post('/home/estaciones/gestionar/:id', async(req, res) => {
	const ide = req.params.id;
	const v1 = req.body.valor1;
	const v2 = req.body.valor2;
	const v3 = req.body.valor3;
	const datosEstacion = {
		ide, v1, v2, v3
	};
	console.log('Estos son los parámetros: ');
	console.log(datosEstacion);
	res.render('EstacionesGestionar.hbs',  {datosEstacion: datosEstacion, 'menu': 'si'}); 
});

router.get('/home/estaciones/diagnostico/:id', async(req, res) => {
	var ide = req.params.id;
	console.log('Este es el id enviad: ', ide);
	res.redirect('/home/estaciones/gestionar/' + ide); 
});




module.exports = router; 