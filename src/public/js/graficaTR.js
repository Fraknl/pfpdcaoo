
if(window.ws){
    console.log('El websocket existe previamente');
}else{
    console.log('No existe ws');
}

/*ws.addEventListener('message', event => {
    console.log('Llega un mensaje');
});*/
/*function getData(){
    return Math.random();
}
Plotly.plot('chart', [{
    y:[getData()],
    type: 'line'
}])
setInterval(function(){
    Plotly.extendTraces('chart',{y:[[getData()]]}, [0])
}, 2000)*/



/*
function isScriptAlreadyIncluded(src){
    var scripts = document.getElementsByTagName("script");
    console.log('Estos son los scripts: ');
    console.log(scripts);
    for(var i = 0; i < scripts.length; i++) 
       if(scripts[i].getAttribute('src') == src) return true;
    return false;
}

let existeScript = isScriptAlreadyIncluded('/js/client.js');
if(existeScript){
    console.log('Ya se crgo client.js');
}else{
    console.log('No se ha cargado')
}*/