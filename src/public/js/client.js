const ws = new WebSocket('ws://localhost:3000/navegador');

var layout = {
    yaxis: {
        title: 'Voltaje',
        range: [0, 150],
        tickmode: 'array',
        automargin: true,
        titlefont: { size:30 },
    }
};

ws.addEventListener('open', () => {
    console.log('Conectado al servidor')
});

ws.addEventListener('message', event => {
    console.log('Mensaje desde el servidor:', event.data);
    console.log('Tipo de dato: ' + typeof(event.data));
    try {
        var js1 = JSON.parse(event.data);
    } catch (error) {
        console.error('No se pudo parsear');
    }

    const boton = js1.boton;
    const texto = js1.texto;
    const tipo = js1.tipo;
    console.log('Este es el boton: ' + boton);
    console.log('Este es el texto: ' + texto);
    console.log('Este es el tipo: ' + tipo);

    if(tipo=='recibido'){
        console.log('Se ha recibido configuración');
        console.log('Esto es el tipo de texto de configuracion: ' + typeof(texto));
        descripcion(8, texto.configurationKey);
        document.getElementById(boton).innerHTML = texto;
    };

    if(tipo=='UnautorizedClient'){
        const acceptKey = js1.acceptKey;
        const protocol = js1.protocol;
        document.getElementById('firstWSHandshake').style.display = 'block';
        document.getElementById('waitingHS').style.display = 'none';
        var storedValueCode = localStorage.getItem("stationCode");
	    var storedValueName = localStorage.getItem("stationName");
	    var storedValueConnector = localStorage.getItem("connectorNumber");
        console.log('Estos son los valores guardados: ');
        console.log(storedValueCode);
        console.log(storedValueName);
        console.log(storedValueConnector);
        console.log('Este es el texto url: ');
        console.log(texto);

        console.log('Este es el accept: ');
        console.log(acceptKey);
        console.log('Este es el protocol: ');
        console.log(protocol);
		localStorage.setItem("acceptKey", acceptKey);
		localStorage.setItem("protocol", protocol);

        if(texto==storedValueCode){
            console.log('Los codigos coinciden');
        }else{
            console.log('Se debe rechazar la conexion')
        }
    }

    if(tipo=='recibidos'){
        document.getElementById(boton).innerHTML = 'No hay vehículo eléctrico conectado';
    };

    if(tipo == 'metervalues'){
        llenartabla(texto);
        console.log('Estos son los valores medidos-------------------')
        for (const property in texto){
            let sampledValue = texto[property];
            for (const property1 in sampledValue){
                console.log(property1 + ' : ' + sampledValue[property1])
            };
        };
    };

    if(tipo == 'meterValue'){
        console.log('Llegan meter values');
        let values = js1.values;
        let connectorId = values.connectorId;
        element = document.getElementById('connectorId'+connectorId)
        console.log('estos son los values')
        console.log(connectorId);
        let voltage = values.meterValue[0].sampledValue[0].value;
        console.log('voltage de carga')
        console.log(voltage);
        Plotly.plot(element, [{
                y:[voltage],
                type: 'line',
            }], layout
        )
        Plotly.extendTraces(element,{y:[[voltage]]}, [0])
            
    };

    if(tipo == 'estado'){
        document.getElementById(boton).innerHTML = texto;

    }if(tipo == 'ping'){
        element = document.getElementById(boton)
        element.style.color = "green";
    }

    if(tipo == 'status'){
        if(texto=='Cargando'){
           console.log('Se esta cargando xdxdxdxd')

        }else{
            console.log('Entra status Notification')
            element = document.getElementById(boton)
            element.innerHTML = texto;
        }
        
    }
});

const $messageForm1 = $('#acceptWsHandshake');    
$messageForm1.click( e => {
    console.log('Se va a aceptar la conexion:');
    e.preventDefault();
    const jsons = JSON.stringify({"tipo": "acceptWsHandshake", 'text':'conexion aceptada', 'message':'Esto es mensaje'});
    socket.send(jsons);
});