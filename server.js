var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);
var bodyParser = require('body-parser');
var ObjectID = require("mongodb").ObjectID;

var coneccion;
var domain = require('domain');
var d = domain.create();


var port = 3000;
server.listen(port);
var databaseUrl = "radios";

var usuariosOnline = new Array();;
console.log('Start Web Services NodeJS in Port ' + port);


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Path de los CSS que utilizarán para el estilo de la página
app.use("/css", express.static(__dirname + '/css'));
app.use("/fonts", express.static(__dirname + '/fonts'));
//Path de funciones en Javascript que podrían utilizar
app.use("/function", express.static(__dirname + '/function'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/img", express.static(__dirname + '/img'));
//Routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/view/app.html');
});


app.post('/send', function(req, res){
	  
	res.sendfile(__dirname + "/view/index.html");
});
app.post('/agregar', function(req, res){

	res.sendfile(__dirname + "/view/add.html");
});

app.post('/modificar', function(req, res){

	res.sendfile(__dirname + "/view/update.html");
});

app.post('/eliminar', function(req, res){

	res.sendfile(__dirname + "/view/delete.html");
});

app.post('/addtoDB', function(req, res){
	  var post_data = req.body;
	
	  var nombre = post_data["radio[nombre]"];
	  var ip = post_data["radio[ip]"];
	  var numPar= post_data["radio[numPar]"]; 
	  var collec = ['radios'];
	  var db = require("mongojs").connect(databaseUrl, collec);
	  var collection = db.collection('radios');
	  db.radios.save({nombre: nombre, dirección: ip, maxUsers: numPar, actualUser: '0' }, function(err, saved) {
		  if( err || !saved ) console.log("No se ha podido guardar la radio");
		  else console.log("Radio guardada con éxito");
		});
	   res.sendfile('/');

});
app.post('/deleteToDB', function(req, res){
	var post_data = req.body;
	var id = post_data["seleccion"];
	var collec = ['radios'];
	var db = require("mongojs").connect(databaseUrl, collec);
	var collection = db.collection('radios');
	db.radios.remove({_id : ObjectID(id)}, {safe: true},function(err, removed){
	        if( err || !removed ) console.log("No se ha podido guardar la radio");
		  	else console.log("Radio eliminada con éxito");
	   		 });
	
	 res.redirect('/');
});
app.post('/updatetoDB', function(req, res){
	var post_data = req.body;
	  var id = post_data["radio[id]"];
	  var nombre = post_data["radio[nombre]"];
	  var ip = post_data["radio[ip]"];
	  var numPar= post_data["radio[numPar]"]; 
	var collec = ['radios'];
	var db = require("mongojs").connect(databaseUrl, collec);
	var collection = db.collection('radios');

	db.radios.update({_id:ObjectID(id)},
			{"nombre": nombre , 
			"dirección" : ip,
			"maxUsers": numPar,
			"actualUser": 0},
			 { upsert: true },
			 function(err, updated){
	        if( err || !updated ) console.log("No se ha podido guardar la radio");
		  	else console.log("Radio modificada con éxito");
    // the update is complete
	});

	res.redirect('/');
});

//server.listen("8000", "127.0.0.1"); 
//console.log('Server running at http://127.0.0.1:8000'); 

io.sockets.on('connection', function (socket) { // conexion
	
	var collec = ['radios'];
	var db = require("mongojs").connect(databaseUrl, collec);
	var collection = db.collection('radios');
	db.radios.find(function(err, docs) {
	// docs is an array of all the documents in mycollection
		for (var i = 0; i < docs.length; i++) {
			socket.emit('cargarRadios', docs[i]);
			//

		};


	});
		

	socket.on('initRoom', function (data) {
		console.log("Entro al chat");
		socket.join(data.room);
	});
	socket.on('actualizarRadio', function (data){
	  var id = data.text;
	  var collec = ['radios'];
	  var db = require("mongojs").connect(databaseUrl, collec);
	  var collection = db.collection('radios');

	  db.radios.find({_id : ObjectID(id)},function(err, docs) {
		// docs is an array of all the documents in mycollection
			for (var i = 0; i < docs.length; i++) {

		// COMPRUEBA QUE LA DIRECCIÓN DE LA RADIO SEA ACCESIBLE POR EL PROTOCOLO HTTP
				// = true;
			
				console.log(docs[i]['actualUser']);
						  var id2 = docs[i]["_id"];
						  var nombre = docs[i]["nombre"];
						  var ip = docs[i]["dirección"];
						  var numPar= docs[i]["maxUsers"];
						  var actualUser =  docs[i]["actualUser"];
						  actualUser = parseInt(actualUser)  + 1;

						 // console.log(ObjectID(id2));
					/*	 
						db.radios.update({_id: id2},
								{"nombre": nombre , 
								"dirección" : ip,
								"maxUsers": numPar,
								"actualUser": String(actualUser)},
								 { upsert: true },
								 function(err, updated){
						        if( err || !updated ) console.log("No se ha podido guardar la radio");
							  	else console.log("Radio modificada con éxito");
					    // the update is complete
						});*/
				var dir = docs[i]['dirección'];
				dir=dir.replace('http:','');
			    dir=dir.replace('/','');
			    dir=dir.replace('/','');
			    dir=dir.replace('/','');
				dir = dir.split(":");
				var options = {
				  host: dir[0],
				  port: dir[1],
				  path: '/'
				};

						
				///d.on('error', function(err) {
				
				

				//});
				if(numPar < actualUser){
					console.log("Número de usuarios maximo alcanzado");
				    socket.broadcast.emit('maxUsuarios', {});
				}
				else
	  			(function(){

					var j = i;	  				

					http.get(options, function(res) {
						docs[j]['dirección'] = "http://"+ dir[0]+ ":"+ dir[1];
					  	console.log("Conección exitosa con: " + dir);
					  	console.log("Docs[j]: " + docs[j]['dirección']);
					  	socket.broadcast.emit('emitirRadio', docs[j]);	 	
					}).on('error', function(e){
						console.log("No ha podido conectar a: " + dir);
						socket.broadcast.emit('emitirRadioERROR',{text: "ERROR"});
			
				  		
					});

				})();
				

			/*	if(coneccion = "OK"){
					socket.broadcast.emit('emitirRadio', docs[i]);
				};/*else if(coneccion = "FAIL"){
					
					socket.broadcast.emit('emitirRadioERROR',{text: "ERROR"});
				}else{
					console.log("Error inesperado!");
				}; */

			};

	  });
	});
	
	socket.on('actualizaModificar', function (data){
			  var id = data.text;
			  var collec = ['radios'];
			  var db = require("mongojs").connect(databaseUrl, collec);
			  var collection = db.collection('radios');
			  db.radios.find({_id : ObjectID(id)},function(err, docs) {
				// docs is an array of all the documents in mycollection
					for (var i = 0; i < docs.length; i++) {
						socket.emit('actualizarFormulario', docs[i]);
						//

					};

			  });	
			  
	});

	/*socket.on('agregar', function (data) {
		
	});*/

	socket.on('disconnect', function () {
		
		if(socket.username) {
			console.log("Usuario desconectado " + socket.username);
			socket.leave();
			var res =socket.username.split("#$%&");


			console.log(res[0]);
			var id = res[2];
	  		var collec = ['radios'];
			var db = require("mongojs").connect(databaseUrl, collec);
			var collection = db.collection('radios');
			var messaje = res[0]+ " ha salido a la sala de chat.";
			var byeUser = usuariosOnline.indexOf(socket.username);
			byeUser > -1 && usuariosOnline.splice( byeUser, 1 );
			console.log(byeUser);
			socket.broadcast.emit('salidaUsuario', { text:messaje, room: res[1]});
			socket.broadcast.emit('updateUsers', usuariosOnline);	
	  		db.radios.find({_id : ObjectID(id)},function(err, docs) {
		// docs is an array of all the documents in mycollection
			for (var i = 0; i < docs.length; i++) {

				// COMPRUEBA QUE LA DIRECCIÓN DE LA RADIO SEA ACCESIBLE POR EL PROTOCOLO HTTP
						// = true;
					
						console.log(docs[i]['actualUser']);
						  var id2 = docs[i]["_id"];
						  var nombre = docs[i]["nombre"];
						  var ip = docs[i]["dirección"];
						  var numPar= docs[i]["maxUsers"];
						  var actualUser =  docs[i]["actualUser"];
						  actualUser = parseInt(actualUser) -1 ;
						 console.log(actualUser);
								 // console.log(actualUser);
 
						 if(actualUser >= 0){
						 	 /*db.radios.update({_id: id2},
								{"nombre": nombre , 
								"dirección" : ip,
								"maxUsers": numPar,
								"actualUser": String(actualUser)},
								 { upsert: true },
								 function(err, updated){
						        if( err || !updated ) console.log("No se ha podido guardar la radio");
							  	else console.log("Radio modificada con éxito");
					    // the update is complete*/
					//	});

						 }		 
						

					};

			  });
		}
		else socket.leave();
		
	});
		
	socket.on('ingresoUser', function (data) {
		socket.username = data.text +"#$%&" + data.room + "#$%&" + data.id;
		usuariosOnline.push(data.text +"#$%&" + data.room+ "#$%&" + data.id);
		console.log("Ingreso el usuario: " + data.text);
		var messaje = data.text+ " ha ingresado a la sala de chat ";
		socket.broadcast.emit('ingresoUsuario', { text:messaje, room: data.room});
		socket.broadcast.emit('updateUsers', usuariosOnline);
	});

	socket.on('ingresoSala', function (data) {
	
		socket.broadcast.emit('enterRoom', { text:data.text});
	});

	socket.on('broadcast', function (data) {
		console.log("Un usuario envió el mensaje: " + data.text);
		socket.broadcast.emit('broadcastCallback', { text:data.text, room: data.room});
	});
});



