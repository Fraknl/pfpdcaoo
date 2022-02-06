
$('body').on('click', 'button', function(e){
    const socket = ws;
    var clicked_button = $(e.target);
    var button_action = clicked_button.data('action');
    console.log('Esta es la action: ' + button_action);
    //var m = [ 2, '1', 'Heartbeat', {} ]
    socket.send(button_action);
});

