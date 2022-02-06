const crypto = require('crypto');
const { urlencoded, text } = require('express');
const { url } = require('inspector');
const { type } = require('os');
const pool = require('./database.js');
const funciones = require('./funciones.js');
var clientes = new Map();
const ffs = require('./ocppFunctions');
const ffsnav = require('./ocppFunctionsServer');

var generateAcceptValue = function (acceptKey) {
    return crypto
    .createHash('sha1')
    .update(acceptKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11', 'binary')
    .digest('base64');
};


var responseHeaders = function(req){
    //clave = estaciones[0].id_estacion;
    const acceptKey = req.headers['sec-websocket-key'];
    const hash = generateAcceptValue(acceptKey);
    const response = [ 
        'HTTP/1.1 101 Switching Protocols', 
        'Upgrade: WebSocket', 
        'Connection: Upgrade', 
        `Sec-WebSocket-Accept: ${hash}`
    ]; 
    const protocol = req.headers['sec-websocket-protocol'];
    const protocols = !protocol ? [] : protocol.split(',').map(s => s.trim());

    if (protocols.includes('ocpp1.6')) {
        console.log('Ha solicitado el subprotocolo ocpp1.6')
        response.push('Sec-WebSocket-Protocol: ocpp1.6');
    };
    console.log('Respuestas a enviar: ');
    console.log(response.join('\r\n') + '\r\n\r\n');
    return response;
}

var responseHeaders1 = function(acceptKey, protocol){
    //clave = estaciones[0].id_estacion;
    //const acceptKey = req.headers['sec-websocket-key'];
    const hash = generateAcceptValue(acceptKey);
    const response = [ 
        'HTTP/1.1 101 Switching Protocols', 
        'Upgrade: WebSocket', 
        'Connection: Upgrade', 
        `Sec-WebSocket-Accept: ${hash}`
    ]; 
    //const protocol = req.headers['sec-websocket-protocol'];
    const protocols = !protocol ? [] : protocol.split(',').map(s => s.trim());

    if (protocols.includes('ocpp1.6')) {
        console.log('Ha solicitado el subprotocolo ocpp1.6')
        response.push('Sec-WebSocket-Protocol: ocpp1.6');
    };
    console.log('Respuestas a enviar: ');
    console.log(response.join('\r\n') + '\r\n\r\n');
    return response;
}

function getByValue(map, searchValue) {
    for (let [key, value] of map.entries()) {
      if (value === searchValue)
        return key;
    }
}

module.exports = function(server){
    server.on('upgrade',  async(req, socket) => { 
        var url_est = req.url.substring(1,req.url.length);
        console.log('                                           ');
        console.log('------------------------------------------------------');
        console.log('Un cliente quiere establecer un websocket: ');
        console.log('Identidad del cliente: ' + url_est)
        var clave;
        if (req.headers['upgrade'] !== 'websocket') {
            socket.end('HTTP/1.1 400 Bad Request');
            return;
        }; 
        
        let query = 'SELECT id_estacion FROM estaciones WHERE codigo_estacion="' + url_est + '";';
        let estaciones = await pool.query(query);
        console.log('resultado sql de estaciones');
        console.log(estaciones)

        /*if (estaciones.length==0){
            let query = 'SELECT id_usuario FROM usuarios WHERE nombre_usuario="' + url_est + '";';
            estaciones = await pool.query(query);
            if(estaciones.length==0){
                socket.end('HTTP/1.1 400 Bad Request');
                return
            }
        };*/

        if(estaciones.length!=0){
            /*console.log('Esto es req');
            console.log(req);*/
            response = responseHeaders(req);
            clave = estaciones[0].id_estacion;
            socket.write(response.join('\r\n') + '\r\n\r\n' );
        }else{
            console.log('La estacion no ha sido agregada aun');
            //socket.end('HTTP/1.1 400 Bad Request');
            clientes.set('temporal', socket);
            clientenav = clientes.get(0);
            const acceptKey = req.headers['sec-websocket-key'];
            const protocol = req.headers['sec-websocket-protocol'];

            var resp = {'tipo': 'UnautorizedClient', 'element':'firstWsHandshake', 'texto': url_est, 
            'acceptKey': acceptKey, 'protocol': protocol}
            clientenav.write(funciones.constructReply(resp, 0x1));

            return;
        }
        

        /*if (!(clave in clientes)){
            
        };*/
        console.log('Estado del socket: ' + socket.readyState);
        if(socket.readyState=='open'){
            clientes.set(clave, socket);
        };

        /*if(socket.readyState=='close'){
            console.log("El cliente cerró la conexión");
        };
        if(socket.readyState=='closed'){
            console.log("El cliente closed la conexión");
        };*/

        socket.on("data", async(buffer) => {
            
            const lista = funciones.parseMessage(buffer);
            if (lista==null){
                return;
            };  
            var message = lista[0]; 
            
            console.log('                                      ');
            console.log('El servidor ha recibido datos----------------------------------------------------------------------');
            console.log('Tipo de dato: ' + typeof(message));
            console.log(message);
            const opCode = lista[1]; 
            const CallId = 2;       
            const CallResultId = 3;
            const CallErrorId = 4;
            if (opCode === 0x1 ) {
                console.log('codigo de operacion 1')
                const MessageTypeId = message[0];
                const UniqueId = message[1];
                var PayloadResponse;

                if (MessageTypeId==2){ 
                    /*************Respuesta para punto de carga*************** */
                    Respuestas = await ffs.funcionesnuevas(message);
                    PayloadResponse = Respuestas[0];
                    PayloadResponseNav = Respuestas[1];
                    console.log('                                            ');
                    let CallResult = [CallResultId, UniqueId, PayloadResponse]; 
                    console.log('Respuesta a enviar al punto de carga: ')
                    console.log(CallResult);
                    socket.write(funciones.constructReply(CallResult, opCode));

                    /*************Respuesta para navegador*************** */
                    if(PayloadResponseNav){ 
                        clientenav = clientes.get(0);
                        if(clientenav){
                            var id_est = getByValue(clientes, socket);
                            PayloadResponseNav.boton = PayloadResponseNav.tipo + id_est;
                            console.log('Respuesta a enviar al navegador: ')
                            console.log(PayloadResponseNav);
                            clientenav.write(funciones.constructReply(PayloadResponseNav, opCode))
                        }else{
                            console.log('Navegador no conectado');
                        } 
                    }
                    

                }else if (MessageTypeId==3){
                    console.log('Se ha recibido un MessageTypeId igual a 3!')
                }else{
                    console.log('Se ha recibido un mensaje desde navegador!')
                    //console.log(Object.values(message))                    
                    if(message.tipo=='acceptWsHandshake'){
                        console.log('navegador solicita aceptar la conexion')
                        var temporalClient = clientes.get('temporal');
                        //var req = message.req;
                        const acceptKey = message.acceptKey;
                        const protocol = message.protocol;
                        response = responseHeaders1(acceptKey, protocol);
                        //clave = estaciones[0].id_estacion;
                        temporalClient.write(response.join('\r\n') + '\r\n\r\n' );
                        //temporalClient.write(funciones.constructReply(response, 0x1));
                        
                    }else{
                        //console.log('Estos son los clientes conectados: ');
                        //console.log(clientes);
                        clientenav = clientes.get(0);
                        PayloadResponse = await ffsnav.funcionesNuevasNav(message, clientes)
                        console.log('                                            ');
                        console.log('El servidor respondes-------------------')
                        let CallResult = [CallResultId, UniqueId, PayloadResponse]; 
                        console.log(CallResult);
                        socket.write(funciones.constructReply(CallResult, opCode));
                    }
                };
            }else if(opCode === 0x9){
                console.log('Entra a op9')
                console.log('Tipo de dato: ping');
                console.log('Contenido: ');
                console.log(message);
                console.log('                                            ');
                console.log('El servidor responde con un pong: ');
                console.log(message);
                socket.write(funciones.constructReply(message, opCode));
                var textnav;
                var id_est = getByValue(clientes, socket);
                let ide = 'ping'+id_est;
                console.log('id de estacion html ' + ide);
                textnav = {'tipo':'ping', 'boton':ide, 'texto':'Recibiendo Pings'};
                
                cliente = clientes.get(0);
                console.log('este es el cliente: ');
                console.log(clientes.keys());
                
                if (cliente){
                    console.log('Si existe el cliente: ')
                    cliente.write(funciones.constructReply(textnav, 1));
                }
                
            }
            







            /*else{
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
                        };*
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
                        };*
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
                        };*
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
                        };*
                    }
                };
            }*/   
        });
    }); 
};


