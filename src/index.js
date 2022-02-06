const http = require('http');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const MySQLStore = require('express-mysql-session');
const {database} = require('./keys');
const passport = require('passport');
const express = require('express');
const flash = require('connect-flash');



//Initializations
const app = express();
require('./lib/passport');


app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, '/public')));
//app.use(passport.session());
//app.use(passport.initialize());
app.set('views', path.join(__dirname, 'views'));

/* nuevo código */
app.use((req, res, next) => {
  app.locals.user = req.user;
  next(); 
});
/**/


/*Middlewares */
app.use(session({
  secret: 'FrankSession',
  resave: false,
  saveUninitialized: false,
  store: MySQLStore(database)
}));
app.use(passport.initialize());
app.use(passport.session())
app.use(flash());

app.engine('.hbs', exphbs({
  defaultLayout: 'main.hbs',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs',
  helpers: require('./lib/handlebars')
}));
app.set('view engine', '.hbs');

app.use(require('./routes/RutasInicio.js'));
app.use(require('./routes/RutasTarjetas.js'));
app.use(require('./routes/RutasEstaciones.js'));
app.use(require('./routes/RutasTransacciones.js'));
 
app.set('port', process.env.PORT || 3000);

app.get('/', function(req, res) {
  console.log('Algo está pasando')
  const principal = path.join(__dirname, '/views/index.hbs');
  res.render(principal);
});

 



var server = http.createServer(app);
server.listen(app.get('port'), () =>{
  console.log('Server on port ', app.get('port'));
});

require('./sockets.js')(server);