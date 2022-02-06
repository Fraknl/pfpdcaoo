
$(function (){
    const socket = ws;
    const $messageForm = $('#pedir_diagnostico');    
    $messageForm.click( e => {
        console.log('Se ha presionado el boto:');
        e.preventDefault();
        const json = {"mensaje": "prueba"};
        socket.send('diagnostico');
    });

    const $messageForm1 = $('#acceptWsHandshake');    
    $messageForm1.click( e => {
	    var storedAcceptKey = localStorage.getItem("acceptKey");
	    var storedProtocol = localStorage.getItem("protocol");
        console.log('Si llega hasta aca: ');
        console.log(storedAcceptKey);
        console.log(storedProtocol)
        console.log('Se va a aceptar la conexion:');
        e.preventDefault();
        const jsons = JSON.stringify({"tipo": "acceptWsHandshake", 
        'text':'conexion aceptada', 'message':'Esto es mensaje',
        'acceptKey': storedAcceptKey, 'protocol': storedProtocol});
        socket.send(jsons);
    });
});

