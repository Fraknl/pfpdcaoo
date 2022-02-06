const express = require('express');
const router = express.Router();
const pool = require('../database');

/*Rutas definitivas*/
router.get('/home/tarjetas/informacion', async(req, res) => {
	const datosTarjeta = await pool.query('SELECT * FROM tarjetas');
    console.log('Este es el resultado de tarjetas: ');
    console.log(datosTarjeta);
    res.render('Tarjetas.hbs', {datosTarjeta: datosTarjeta, 'menu': 'si'}); 
});

router.get('/home/tarjetas/agregar', async(req, res) => {
    res.render('TarjetasAnadir.hbs', {'menu': 'si'}); 
});

router.post('/home/tarjetas/agregar', async (req, res) => {
    console.log('El formulario ha enviado lo siguiente: ');
    var crfid = req.body.codigo_rfid;
    var est = req.body.estado;
    console.log(crfid);
    console.log(est);
    var ult_tar = await pool.query('SELECT id_tarjeta FROM tarjetas ORDER BY id_tarjeta DESC LIMIT 1');
    //console.log('Esto es id_tarjeta: ' + ult_tar[0].id_tarjeta);


    if(ult_tar.length==0){
        console.log('si es cero')
        ult_tar = 1;
    }else{
        ult_tar = ult_tar[0].id_tarjeta + 1;
    };
    console.log('Esto es id_tarjeta: ' + ult_tar);
    const it = await pool.query('INSERT INTO tarjetas VALUES (?,?,?);', [ult_tar, crfid, est]);
    console.log(it.insertId);
    if(it.insertId){
        var mensaje = 'Tarjeta añadida exitósamente';
    }else{
        var mensaje = 'Ha ocurrido un problema al intentar subir la información'
    };
    res.render('TarjetasAnadir.hbs', {'mensaje': mensaje, 'menu': 'si'}); 
});



router.get('/home/tarjetas/eliminar/:id', async(req, res) => {
	var idt = req.params.id;
	await pool.query('DELETE FROM tarjetas WHERE id_tarjeta=?', idt);
	res.redirect('/home/tarjetas/informacion');
});

router.get('/home/tarjetas/editar/:id', async(req, res) => {
	var idt = req.params.id;
    var select = 'SELECT * FROM tarjetas ';
	var where = 'WHERE id_tarjeta="' + idt + '";';
	const datosTarjeta = await pool.query(select + where);
	console.log(datosTarjeta);
	res.render('TarjetasEditar.hbs', {datosTarjeta: datosTarjeta[0], 'menu': 'si'}); 
});

router.post('/home/tarjetas/actualizar/:id', async(req, res) => {
	var id = req.params.id;
	//var idt = req.body.idtarjeta
    var crfid = req.body.codigorfid
    var estado = req.body.estadotarjeta
	//var nes = req.body.nombreestacion;
	//var ubi = req.body.ubicacion;
	var tes = req.body.tipoestacion;
	var update = 'UPDATE tarjetas ';
	var set = 'SET codigo_rfid="' + crfid + '", estado="' + estado ;
	var where = '" WHERE id_tarjeta="' + id + '";';
	var query = update + set + where;
	console.log(query); 
	await pool.query(query);
    res.redirect('/home/tarjetas/informacion'); 
});




 













/* En prueba aun*/
 

router.get('/IngresarSaldo:idt', async(req, res) => {
    const idt = req.params.idt;
    const saldo = 100;
    console.log('Esto es id: ' + idt);
    const query = 'UPDATE tarjeta_usuario SET saldo=' + saldo + ' WHERE codigo_tarjeta="' + idt + '";';
    console.log('Esta es la query: ' + query)
    const insert = await pool.query(query);
    console.log(insert);
    res.send('Se ha ingresado el saldo');
});


router.get('/VerTarjetas:idu', async(req, res) => {
    const idu = req.params.idu;
    console.log('Esto es id: ' + idu);
    const query = 'SELECT * FROM tarjeta_usuario WHERE id_usuario=' + idu + ';'
	const TarjetasUsuario = await pool.query(query);
    res.render('TarjetasUsuario.hbs', {TarjetasUsuario: TarjetasUsuario, 'menuadmin': 'si'}); 
});








router.get('/Tarjetas/eliminar/:id', async(req, res) => {
    var idt = req.params.id;
    console.log(idt);
    var delet = 'DELETE FROM tarjetas ';
    var where = 'WHERE id_tarjeta="' + idt + '";';
    var query = delet + where;
    console.log(query)
    const dt = await pool.query(query);
    console.log(dt);
	res.redirect('/Tarjetas')
});




router.get('/Tarjetas/editar/:id', async(req, res) => {
    var idt = req.params.id;
    console.log(idt);
    var select = 'SELECT * FROM tarjetas ';
    var where = 'WHERE id_tarjeta="' + idt + '";';
    var query = select + where;
    console.log(query)
	const datosTarjeta = await pool.query(query);
	console.log(datosTarjeta)
	res.render('TarjetasEditar.hbs',  {datosTarjeta: datosTarjeta[0], 'menuadmin': 'si'})
});



router.post('/TarjetasActualizar/:id', async(req, res) => {
	var idt = req.params.id;
	var ct = req.body.codigo_tarjeta;
	var et = req.body.estado_tarjeta;
	
    var update = 'UPDATE tarjetas ';
    var set = 'SET codigo_tarjeta="' + ct + '", estado_tarjeta="' + et + '" ';
	var where = 'WHERE id_tarjeta="' + idt + '";';
	var query = update + set + where;
	console.log(query); 
    const ut = await pool.query(query);
    console.log(ut)
    res.redirect('/Tarjetas'); 
});



router.get('/tarjetas/adjuntar/:id', function(req, res) {
    var idu = req.params.id;
    console.log('el idu es: '+ idu)
    res.render('TarjetasAdjuntar.hbs', {'idu': idu, 'menuadmin': 'si'}); 
});


router.post('/tarjetas/adjuntar/:idu', async(req, res) => {
    var idu = req.params.idu;
    var cdt = req.body.ctl;
    var saldo = req.body.saldo_tarjeta;

    var insert = 'INSERT INTO tarjeta_usuario (codigo_tarjeta, id_usuario, saldo) ';
    var values = 'VALUES ("' + cdt + '", "' + idu + '", "' + saldo + '");';

    var query = insert + values;
    console.log('Resultados de la consulta: ');
    console.log(query)
    const atu = await pool.query(query);
    console.log(atu);
    
    res.render('TarjetasAdjuntar.hbs', {'mensaje': 'Tarjeta adjuntada exitósamente', 'menuadmin': 'si'}); 
});


module.exports = router; 