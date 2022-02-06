const { response } = require('express');
const pool = require('./database.js');
const funciones = require('./funciones.js');

function GetConfigurationReq(clientes, Action, ide){
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
        };*/
    }
}

async function RemoteStopTransactionReq(){
    const claves = clientes.keys(clientes, Action, ide);
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
        };*/
    }
}

function ChangeConfigurationReq(){
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
        };*/
    }
}

function ReserveNowReq(){
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
        };*/
    }
}

function CancelReservationNow(){
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
    }
}
async function RemoteStartTransactionReq(clientes, Action, ide){
    console.log('Entra a remote start transaction')
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
    
    //PayloadResponse = {"idTagInfo": {"status": "Accepted"}, "transactionId": transactionId};
    let len = 2
    const claves = clientes.keys();
    const Request = [2,'1002', Action, {'idTag': '0002020030000813', 'connectorId':1, 'chargingProfile':{'transactionId':transactionId}}];
    for (var i=0; i<2; i++){
        var key = claves.next().value;
        console.log('Esta es la llave: ' + key)
        if (ide==key){
            console.log('Se encontro una estacion cliente')
            cliente = clientes.get(key);
            cliente.write(funciones.constructReply(Request, 1));
            pool.query(sql, [values], function (err, result) {
                if (err) throw err;
                console.log("Se ha ingresado " + result.affectedRows + " fila(s) a la base de datos");
            }); 
        }else{
            console.log('No estacion cliente')
        }
    }
    //PayloadResponse = {"idTagInfo": {"status": "Accepted"}};
    //return PayloadResponse
}


async function funcionesNuevasNav (message, clientes){
    console.log('Esto es message ');
    console.log(message);
    var PayloadResponse;
    var ide = parseInt(message.substring(0,1), 10);
    const Action = message.substring(1, message.length);
    const currentDate = new Date();   
    //OPERACIONES INICIADAS DESDE EL NAVEGADOR WEB
    if(Action=='RemoteStartTransaction'){
        PayloadResponse = RemoteStartTransactionReq(clientes, Action, ide)
    }else if(Action=='GetConfiguration'){
        PayloadResponse = GetConfigurationReq(clientes, Action, ide)
    };

    return PayloadResponse

}


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