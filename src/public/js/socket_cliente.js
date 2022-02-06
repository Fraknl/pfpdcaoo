const clienteWS = require('websocket').client;
const clienteWSApp = new clienteWS();
const url = 'ws://localhost:3000/';
//const idt = 'EC0120040001';
const idt = 'navegador';
const uri = url+ idt;

clienteWSApp.connect(uri, 'echo-protocol');

clienteWSApp.on('connectFailed', function(error){
    console.log('Error al intentar conectarse al servidor: ' + error.toString());
});

clienteWSApp.on('connect', function(conexion){
    console.log('Cliente conectado al servidor webscoket!');
});

conexion.on('message', function(mensaje){
    console.log('Mensaje recibido: ' + mensaje.utf8Data);
});

function envioIDCliente(){
    if(conexion.connected){
        var idCliente = Math.round(Math.random() * 0xFFFFFF );
        conexion.sendUTF(idCliente.toString());

    };
};

envioIDCliente()

conexion.on('error', function(error){
    console.log('connecto error: ' + error.toString());
});

conexion.on('close', function(){
    console.log('Conexion cerrada!');
});
