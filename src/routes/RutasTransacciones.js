const express = require('express');
const router = express.Router();
const pool = require('../database');

function timeConverter(UNIX_timestamp){
	var a = new Date(UNIX_timestamp);
	var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var date = a.getDate();
	var hour = a.getHours();
	var min = a.getMinutes();
	var sec = a.getSeconds();
	var time = date + '-' + month + '-' + year + ' ' + hour + ':' + min + ':' + sec ;
	return time;
  }


router.get('/home/transacciones/informacion', async(req, res) => {
	const datosTransaccion = await pool.query('SELECT * FROM transacciones;'); 

	for (const prop in datosTransaccion){
		datosTransaccion[prop].hora_inicio = timeConverter(datosTransaccion[prop].hora_inicio);
		datosTransaccion[prop].hora_fin = timeConverter(datosTransaccion[prop].hora_fin);
	};

	for (const prop in datosTransaccion){
		console.log(prop);
		console.log(datosTransaccion[prop])
	};
	res.render('Transacciones.hbs', {datosTransaccion: datosTransaccion, 'menu': 'si'}); 
}); 
 
router.get('/home/transacciones/eliminar/:id', async(req, res) => {
	var idt = req.params.id;
	await pool.query('DELETE FROM transacciones WHERE id_transaccion=?', idt);
	res.redirect('/home/transacciones/informacion');
});




module.exports = router; 