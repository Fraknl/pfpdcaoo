
/*
const crypto = require('crypto');
const { urlencoded, text } = require('express');
const { url } = require('inspector');
const { type } = require('os');
const funciones = require('./funciones.js');
var clientes = new Map();


var generateAcceptValue = function (acceptKey) {
return crypto
.createHash('sha1')
.update(acceptKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11', 'binary')
.digest('base64');
};
*/
const { response } = require('express');
const pool = require('./database.js');


async function AuthorizeResponse(crfid){
    const datosTarjeta = await pool.query('SELECT id_tarjeta, estado FROM tarjetas where codigo_rfid="' + crfid + '";');
    console.log(datosTarjeta);
    if (datosTarjeta.length==1){
        if (datosTarjeta[0].estado=='Accepted'){
            return {"idTagInfo": {"status": "Accepted"}};
        }else{
            return {"idTagInfo": {"status": "Blocked"}};
        } 
    }else{
        return {"idTagInfo": {"status": "Invalid"}};
    }
}


function StatusNotificationResponse(Payload){
    console.log('Esto es pyload functions');
    console.log(Payload);

    PayloadResponse = {};
    PayloadResponseNav = {'tipo': 'status', 'texto':Payload.status};

    return [PayloadResponse, PayloadResponseNav];
}



async function StartTransactionResponse(Payload){
    let idTag = Payload.idTag;
    let meterStart = Payload.meterStart;
    let connectorId = Payload.connectorId;
    let hora_inicio = Payload.timestamp;
    var transactionId;
    let ultTrans0 = await pool.query('SELECT id_transaccion FROM transacciones ORDER BY id_transaccion DESC LIMIT 1;');
    if(ultTrans0.length==0){
        transactionId=1;
    }else{
        transactionId = ultTrans0[0].id_transaccion + 1;
    }
    PayloadResponse = {"idTagInfo": {"status": "Accepted"}};
    let idStation = 1;
    let ec = '0';
    let sql = 'INSERT INTO transacciones VALUES (?)';
    let estado = 'Iniciada';
    var values = [transactionId, idStation, idTag, connectorId, 
        hora_inicio, hora_inicio, meterStart, meterStart, ec, estado, estado];
    pool.query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log("Se ha ingresado " + result.affectedRows + " fila a la base de datos");
    });
    PayloadResponse = {"idTagInfo": {"status": "Accepted"}, "transactionId": transactionId};
    //PayloadResponseNav = {'tipo': 'status', 'texto':'cargando'};

    console.log('finaliza StartTransactionResponse')
    return PayloadResponse
}

function MeterValuesConf(Payload){
    var meterValues = Payload.meterValue;
    var sampledValues = meterValues[0].sampledValue;
 
    PayloadResponse = {}
    for (const property in sampledValues){
        let sampledValue = sampledValues[property];
        console.log(property + ' : ' + sampledValue);
        for (const property1 in sampledValue){
            console.log(property1 + ' : ' + sampledValue[property1])
        };
    };
    /*
    if (clientenav){
        clientenav.write(funciones.constructReply(textnav, 1));
    } */
    PayloadResponseNav = {'tipo': 'meterValue', 'texto':'cargando', 'values': Payload};

    return [PayloadResponse, PayloadResponseNav]
}

async function StopTransactionConf(Payload){
    /*for (const property in Payload){
        console.log(property + ' : ' + Payload[property]);
    };*/
    let estado = 'Finalizada' 
    let transactionId = Payload.transactionId;
    let hora_fin = Payload.timestamp;
    let meterStart = await pool.query('SELECT energia_inicio FROM transacciones WHERE id_transaccion='+transactionId+';');
    let meterStop = Payload.meterStop;
    let ec = parseInt(meterStop,10) - parseInt(meterStart[0].energia_inicio,10);
    ec = ec*1000;
    console.log(ec);
    let razon = Payload.reason;
    const values = [hora_fin, meterStop, ec, estado, razon, transactionId]
    let sql = 'UPDATE transacciones SET hora_fin=?, energia_fin=?, energia_consumida=?, estado=?, razon=? WHERE id_transaccion=?';
    pool.query(sql, values, function (err, result) {
        if (err) throw err;
        console.log("Number of records updated: " + result.affectedRows);
    });
    PayloadResponse = {"idTagInfo": {"status": "Accepted"}};
    return PayloadResponse
}

async function RemoteStartTransactionReq(Payload){
    var transactionId;
    let ultTrans0 = await pool.query('SELECT id_transaccion FROM transacciones ORDER BY id_transaccion DESC LIMIT 1;');
    if(ultTrans0.length==0){
        transactionId=1;
    }else{
        transactionId = ultTrans0[0].id_transaccion + 1;
    }
    let ultValor = await pool.query('SELECT energia_fin FROM transacciones ORDER BY id_transaccion DESC LIMIT 1;');
    let meterStart = ultValor[0].energia_fin
    let idStation = 1;
    let ec = '0';
    let sql = 'INSERT INTO transacciones VALUES (?)';
    let estado = 'Initialized';
    let idTag = '0002020030000813';
    let connectorId = 1;
    const currentDate = new Date();
    let hora_inicio = currentDate;

    var values = [transactionId, idStation, idTag, connectorId, 
        hora_inicio, hora_inicio, meterStart, meterStart, ec, estado, estado];
    pool.query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log("Se ha ingresado " + result.affectedRows + " fila(s) a la base de datos");
    });
    //PayloadResponse = {"idTagInfo": {"status": "Accepted"}, "transactionId": transactionId};
    let len = 2
    const claves = clientes.keys();
    const Request = [2,'1002', Action, {'idTag': '0002020030000813', 'connectorId':1, 'chargingProfile':{'transactionId':transactionId}}];
    for (var i=0; i<2; i++){
        var key = claves.next().value;
        //console.log('Esta es la llave: ' + key)
        if (ide==key){
            cliente = clientes.get(key);
            cliente.write(funciones.constructReply(Request, 1));
        }
    }
    //PayloadResponse = {"idTagInfo": {"status": "Accepted"}};
    //return PayloadResponse
}

async function funcionesnuevas (message){
    var PayloadResponse;
    let Action = message[2]; 
    let Payload = message[3];
    const currentDate = new Date();   
    if (Action=='BootNotification'){
        PayloadResponse = {"status":"Accepted", "currentTime":currentDate, "interval":300}
    }else if (Action=='StatusNotification'){
        console.log('llega al servidor un status notification')
        //PayloadResponse = {"status":"Accepted", "timestamp": currentDate};
        PayloadResponse = await StatusNotificationResponse(Payload);
        //PayloadResponse = {}
    }else if (Action=='Heartbeat'){
        PayloadResponse = {"currentTime": currentDate};
    }else if (Action=='Authorize'){
        PayloadResponse = await AuthorizeResponse(Payload.idTag);
        //console.log('ESTA ES LA CONSULTA: ' + resp);
    }else if(Action=='StartTransaction'){
        PayloadResponse = await StartTransactionResponse(Payload);
    }else if(Action=='MeterValues'){
        PayloadResponse = MeterValuesConf(Payload);
    }else if(Action=='StopTransaction'){
        PayloadResponse = StopTransactionConf(Payload)
    }else{
        //OPERACIONES INICIADAS DESDE EL NAVEGADOR WEB
        if(Action=='RemoteStartTransaction'){
            PayloadResponse = StopTransactionConf(Payload)
        };
    }
    
    

    return PayloadResponse

    /*console.log('                                            ');
    console.log('El servidor responde-------------------')
    let CallResult = [CallResultId, UniqueId, PayloadResponse]; 
    console.log(CallResult);
    socket.write(funciones.constructReply(CallResult, opCode));
    */
}


async function funcionesNuevasNav (message){
    var PayloadResponse;
    let Action = message[2]; 
    let Payload = message[3];
    const currentDate = new Date();   
    //OPERACIONES INICIADAS DESDE EL NAVEGADOR WEB
    if(Action=='RemoteStartTransaction'){
        PayloadResponse = StopTransactionConf(Payload)
    };

    return PayloadResponse

}


module.exports.funcionesnuevas = funcionesnuevas;
module.exports.funcionesNuevasNav = funcionesNuevasNav;
    /*
    cliente = clientes.get(0);
    console.log('este es el cliente: ' + cliente)
    if (cliente){
        console.log('Si existe el cliente: ')
        cliente.write(funciones.constructReply("pong", 1));
    }
    */
    
    /*
    }else{
    var Payload = message[2];
    var act = message[1]
    //console.log('MessageTypeId es igual a 3');
    var configurationKey  = Payload.configurationKey;
    //var unknownKey  = Payload.unknownKey;
    var textnav;
    console.log('Estas son las configuraciones enviadas por el punto de carga: ');
    var algo = Payload.status;
    console.log('La reserva ha sido: ' + algo);
    
    for (const prop1 in configurationKey){
        console.log('Item ' + prop1 );
        console.log(configurationKey[prop1]);
    };
    textnav = {'boton':'descripcion_estacion', 'tipo':'recibido', 'texto':Payload}
    clienten = clientes.get(0);
    if (act == '1005'){
        if(Payload.status == 'Accepted'){
            textnav = {'boton':'descripcion_estacion', 'tipo':'recibido', 'texto':Payload}
        }
    }
    if (act=='1001' || act=='1000'){
        clienten.write(funciones.constructReply(textnav, 1));
    }
    if (act == '1002'){
        if (Payload.status=='Accepted'){
            textnav = {'boton':'descripcion_estacion', 'tipo':'cra', 'texto':Payload}
            clienten.write(funciones.constructReply(textnav, 1));
        }else{
            textnav = {'boton':'estado_estacion', 'tipo':'recibidos', 'texto':'Vehículo eléctrico no conectado'}
            clienten.write(funciones.constructReply(textnav, 1));
        }
    }
    
    };
    };
    }else{ 
    if(opCode === 0x9){
    console.log('Tipo de dato: ping');
    console.log('Contenido: ');
    console.log(message); 
    console.log('                                            ');
    console.log('El servidor responde con un pong: ');
    console.log(message);
    socket.write(funciones.constructReply(message, opCode));
    var textnav;
    textnav = {'boton':'ping_estacion','texto':'Recibiendo Pings'}
    cliente = clientes.get(0);
    console.log('este es el cliente: ' + cliente)

    if (cliente){
    console.log('Si existe el cliente: ')
    cliente.write(funciones.constructReply(textnav, 1));
    }
    
    
    
    }else{
    console.log('Se ha recibido un dato desde el navegador');
    console.log('Contenido: ' + message);
    var ide = parseInt(message.substring(0,1), 10);
    const Action = message.substring(1, message.length);
    var PayloadRequest;
    
    if(Action=='GetConfiguration'){
    console.log('si entra en action')
    PayloadRequest = {'key':['HeartbeatInterval']};
    const claves = clientes.keys();
    console.log('Estas son las claves de clientes: ');
    console.log(claves);
    let len = 2
    
    const KeysArray = ['AuthorizationCacheEnabled',
    'AuthorizeRemoteTxRequests',
    'AllowOfflineTxForUnknownId',
    'HeartbeatInterval',
    'MeterValueSampleInterval', 
    'LocalAuthorizeOffline',
    'ConnectionTimeOut',
    'LightIntensity'];
    const Request = [2,'1000', Action, {'key': KeysArray}];
    for (var i=0; i<len; i++){
        var key = claves.next().value;
        //console.log('Esta es la llave: ' + key)
        if (ide==key){
            cliente = clientes.get(key);
            cliente.write(funciones.constructReply(Request, 1));
        }/*else{
            console.log('No existe el cliente: ')
        };
    }
    }else if(Action=='RemoteStartTransaction'){
    var transactionId;
    let ultTrans0 = await pool.query('SELECT id_transaccion FROM transacciones ORDER BY id_transaccion DESC LIMIT 1;');
    if(ultTrans0.length==0){
        transactionId=1;
    }else{
        transactionId = ultTrans0[0].id_transaccion + 1;
    }
    let ultValor = await pool.query('SELECT energia_fin FROM transacciones ORDER BY id_transaccion DESC LIMIT 1;');
    let meterStart = ultValor[0].energia_fin
    let idStation = 1;
    let ec = '0';
    let sql = 'INSERT INTO transacciones VALUES (?)';
    let estado = 'Iniciada';
    let idTag = '0002020030000813';
    let connectorId = 1;
    const currentDate = new Date();
    let hora_inicio = currentDate;
    
    var values = [transactionId, idStation, idTag, connectorId, 
        hora_inicio, hora_inicio, meterStart, meterStart, ec, estado, estado];
    pool.query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log("Se ha ingresado " + result.affectedRows + " fila a la base de datos");
    });
    //PayloadResponse = {"idTagInfo": {"status": "Accepted"}, "transactionId": transactionId};
    let len = 2
    const claves = clientes.keys();
    const Request = [2,'1002', Action, {'idTag': '0002020030000813', 'connectorId':1, 'chargingProfile':{'transactionId':transactionId}}];
    for (var i=0; i<2; i++){
        var key = claves.next().value;
        //console.log('Esta es la llave: ' + key)
        if (ide==key){
            cliente = clientes.get(key);
            cliente.write(funciones.constructReply(Request, 1));
        }
    }
    }else if(Action=='RemoteStopTransaction'){
    const claves = clientes.keys();
    var ultTrans0 = await pool.query('SELECT id_transaccion FROM transacciones ORDER BY id_transaccion DESC LIMIT 1;');
    let transactionId = ultTrans0[0].id_transaccion;
    console.log('Este es el id de la ultima transaccion: ' + transactionId)
    const Request = [2,'1003', Action, {'transactionId' : transactionId}];
    
    for (var i=0; i<2; i++){
        var key = claves.next().value;
        if (ide==key){
            cliente = clientes.get(key);
            cliente.write(funciones.constructReply(Request, 1));
        }/*else{
            console.log('No existe el cliente: ')
        };
    }
    }else if(Action=='ChangeConfiguration'){
    console.log('Si entra en cambiar configuration:')
    let ide = 1;
    const claves = clientes.keys();
    var Request = [2,'1001', Action, {'key':'MeterValueSampleInterval','value':'3'}];
    //Request = [2,'1001', Action, {'key':'HeartbeatInterval', 'value': '600'}];
    
    for (var i=0; i<2; i++){
        var key = claves.next().value;
        if (ide==key){
            cliente = clientes.get(key);
            cliente.write(funciones.constructReply(Request, 1));
        }/*else{
            console.log('No existe el cliente: ')
        };
    }
    }else if(Action == 'ReserveNow'){
    //let ide = 1;
    const claves = clientes.keys();
    const currentDate = new Date();
    const agregaMinutos =  function (dt, minutos) {
        return new Date(dt.getTime() + minutos*60000);
    }
    const nh = agregaMinutos(currentDate,1)
    console.log(nh);
    var Request = [2,'1005', Action, {'connectorId':1,'expiryDate': nh, 'idTag': '0002020030000813', 'reservationId':2}];
    for (var i=0; i<2; i++){
        var key = claves.next().value;
        if (ide==key){
            cliente = clientes.get(key);
            cliente.write(funciones.constructReply(Request, 1));
        }/*else{
            console.log('No existe el cliente: ')
        };
    }
    }else if(Action == 'CancelReservation'){
    console.log('Entra a cancel')
    let ide = 1;
    const claves = clientes.keys();
    var Request = [2,'1006', Action, {'reservationId':2}];
    for (var i=0; i<2; i++){
        var key = claves.next().value;
        if (ide==key){
            cliente = clientes.get(key);
            cliente.write(funciones.constructReply(Request, 1));
        }/*else{
            console.log('No existe el cliente: ')
        };*/