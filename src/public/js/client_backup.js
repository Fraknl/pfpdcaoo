//const ws = new WebSocket('wss://ocppnewserver.herokuapp.com/navegador');
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

function tableCreate(n) {
    const nom = ['a', 'b', 'c', 'd'];
    const nom2 = ['e', 'f', 'g', 'h'];
    const cabec = ['Energía [Vatios/hora]', 'Voltage en fase 1 (Voltios)', 'Corriente [Amperes]', 'Potencia [Kilovatios]']
    var body = document.getElementsByTagName('body')[0];
    var tbl = document.createElement('table');
    tbl.style.width = '100%';
    tbl.setAttribute('border', '1');
    var tbdy = document.createElement('tbody');
    for (var i = 0; i < 2; i++) {
        var tr = document.createElement('tr');
        for (var j = 0; j < n; j++) {
            if (i == 2 && j == 3) {
            break
            } else {
            var td = document.createElement('td');
            td.appendChild(document.createTextNode('\u0020'))
            i == 1 && j == 1 ? td.setAttribute('rowSpan', '5') : null;
            if (i==0){
                td.setAttribute('id', nom[j])
            }else if (i==1){
                td.setAttribute('id', nom2[j])
            }
            tr.appendChild(td)
            }
      }
      tbdy.appendChild(tr);
    }
    tbl.appendChild(tbdy);
    body.appendChild(tbl);
    document.getElementById('a').innerHTML = cabec[0];
    document.getElementById('b').innerHTML = cabec[1];
    document.getElementById('c').innerHTML = cabec[2];
    document.getElementById('d').innerHTML = cabec[3];
};

function llenartabla(texto){
    console.log('Esto es texto: ');
    console.log(texto[0]);
    console.log(texto[0].value);
    document.getElementById('e').innerHTML = texto[0].value*1000;
    document.getElementById('f').innerHTML = texto[1].value;
    document.getElementById('g').innerHTML = texto[2].value;
    document.getElementById('h').innerHTML = texto[3].value;
};

function descripcion(n, texton) {
    var body = document.getElementsByTagName('body')[0];
    var tbl = document.createElement('table');
    tbl.style.width = '100%';
    tbl.setAttribute('border', '1');
    var tbdy = document.createElement('tbody');
    const nomb = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const nomb2 = ['aa', 'bb', 'cc', 'dd', 'ee', 'ff', 'gg', 'hh'];
    for (var i = 0; i < 8; i++) {
        var tr = document.createElement('tr');
        for (var j = 0; j < 2; j++) {
            if (i == n && j == 2) {
                break
            } else {
            var td = document.createElement('td');
            td.appendChild(document.createTextNode('\u0020'))
            //i == 1 && j == 1 ? td.setAttribute('rowSpan', '5') : null;
            if (j==0){
                td.setAttribute('id', nomb[i])
            }else if (j==1){
                td.setAttribute('id', nomb2[i])
            }
            tr.appendChild(td)
            }
      }
      tbdy.appendChild(tr);
    }
    tbl.appendChild(tbdy);
    body.appendChild(tbl);
    document.getElementById('a').innerHTML = texton[0].key;
    document.getElementById('b').innerHTML = texton[1].key;
    document.getElementById('c').innerHTML = texton[2].key;
    document.getElementById('d').innerHTML = texton[3].key;
    document.getElementById('e').innerHTML = texton[4].key;
    document.getElementById('f').innerHTML = texton[5].key;
    document.getElementById('g').innerHTML = texton[6].key;
    document.getElementById('h').innerHTML = texton[7].key;

    document.getElementById('aa').innerHTML = texton[0].value;
    document.getElementById('bb').innerHTML = 'true';
    document.getElementById('cc').innerHTML = texton[2].value;
    document.getElementById('dd').innerHTML = texton[3].value;
    document.getElementById('ee').innerHTML = texton[4].value;
    document.getElementById('ff').innerHTML = texton[5].value;
    document.getElementById('gg').innerHTML = texton[6].value;
    document.getElementById('hh').innerHTML = texton[7].value;

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
    console.log(js1)
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
        document.getElementById('firstWSHandshake').style.display = 'block';
        document.getElementById('waitingHS').style.display = 'none';
    }

    if(tipo=='recibidos'){
        document.getElementById(boton).innerHTML = 'No hay vehículo eléctrico conectado';
    };

    if(tipo=='ed'){
        document.getElementById(boton).innerHTML = 'Estación disponible';
    };

    if(tipo=='pr'){
        document.getElementById(boton).innerHTML = 'Vehículo eléctrico conectado';
    };

    if(tipo=='cra'){
        tableCreate(4);
        document.getElementById(boton).innerHTML = 'Cargando';
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
            /*console.log('Llegan datos de carga aqui');
            element = document.getElementById('chart')
            //element.innerHTML = texto;

            function getData(){
                return Math.random();
            }

            Plotly.plot(element, [{
                y:[getData()],
                type: 'line'
            }])

            setInterval(function(){
                Plotly.extendTraces(element,{y:[[getData()]]}, [0])
            }, 2000)*/

        }else{
            console.log('Entra status Notification')
            element = document.getElementById(boton)
            element.innerHTML = texto;
        }
        
    }
});



