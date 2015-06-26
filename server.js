var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);
var bodyParser = require('body-parser');
var ObjectID = require("mongodb").ObjectID;
var CryptoJS = require("crypto-js");
var coneccion;
var domain = require('domain');
var d = domain.create();


var port = 3000;
server.listen(port);
var databaseUrl = "estudiantes";

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

 	  var rut =  post_data["estudiante[rut]"];
	  var nombre = post_data["estudiante[nombre]"];
	  var apellidoP = post_data["estudiante[apellidoP]"];
	  var apellidoM = post_data["estudiante[apellidoM]"];
	  var email= post_data["estudiante[email]"]; 
	  var universidad= post_data["estudiante[universidad]"]; 
	  var carrera= post_data["estudiante[carrera]"]; 
	  var años= post_data["estudiante[años]"]; 
	  var collec = ['estudiantes'];
	  
	  var r = sha1(rut.toString());
	  console.log(r);

	  console.log(rut + " " + nombre + " "+ apellidoP + " " + apellidoM + " " + email + " " + universidad + " " + carrera + " " + años + " " );
	  /*
	  var db = require("mongojs").connect(databaseUrl, collec);
	  var collection = db.collection('radios');
	  db.radios.save({nombre: nombre, dirección: ip, maxUsers: numPar, actualUser: '0' }, function(err, saved) {
		  if( err || !saved ) console.log("No se ha podido guardar la radio");
		  else console.log("Radio guardada con éxito");
		});
		*/
	   res.redirect('/');

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






function sha1(str) 
{
	  var rotate_left = function(n, s) {
		var t4 = (n << s) | (n >>> (32 - s));
		return t4;
		};
      var cvt_hex = function(val) {
	    var str = '';
	    var i;
	    var v;

	    for (i = 7; i >= 0; i--) {
	      v = (val >>> (i * 4)) & 0x0f;
	      str += v.toString(16);
	    }
	    return str;
	  };

	  var blockstart;
	  var i, j;
	  var W = new Array(80);
	  var H0 = 0x67452301;
	  var H1 = 0xEFCDAB89;
	  var H2 = 0x98BADCFE;
	  var H3 = 0x10325476;
	  var H4 = 0xC3D2E1F0;
	  var A, B, C, D, E;
	  var temp;

	  str = utf8_encode(str);
	  var str_len = str.length;

	  var word_array = [];
	  for (i = 0; i < str_len - 3; i += 4) {
	    j = str.charCodeAt(i) << 24 | str.charCodeAt(i + 1) << 16 | str.charCodeAt(i + 2) << 8 | str.charCodeAt(i + 3);
	    word_array.push(j);
	  }

	  switch (str_len % 4) {
	    case 0:
	      i = 0x080000000;
	      break;
	    case 1:
	      i = str.charCodeAt(str_len - 1) << 24 | 0x0800000;
	      break;
	    case 2:
	      i = str.charCodeAt(str_len - 2) << 24 | str.charCodeAt(str_len - 1) << 16 | 0x08000;
	      break;
	    case 3:
	      i = str.charCodeAt(str_len - 3) << 24 | str.charCodeAt(str_len - 2) << 16 | str.charCodeAt(str_len - 1) <<
	        8 | 0x80;
	      break;
	  }

	  word_array.push(i);

	  while ((word_array.length % 16) != 14) {
	    word_array.push(0);
	  }

	  word_array.push(str_len >>> 29);
	  word_array.push((str_len << 3) & 0x0ffffffff);

	  for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
	    for (i = 0; i < 16; i++) {
	      W[i] = word_array[blockstart + i];
	    }
	    for (i = 16; i <= 79; i++) {
	      W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
	    }

	    A = H0;
	    B = H1;
	    C = H2;
	    D = H3;
	    E = H4;

	    for (i = 0; i <= 19; i++) {
	      temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
	      E = D;
	      D = C;
	      C = rotate_left(B, 30);
	      B = A;
	      A = temp;
	    }

	    for (i = 20; i <= 39; i++) {
	      temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
	      E = D;
	      D = C;
	      C = rotate_left(B, 30);
	      B = A;
	      A = temp;
	    }

	    for (i = 40; i <= 59; i++) {
	      temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
	      E = D;
	      D = C;
	      C = rotate_left(B, 30);
	      B = A;
	      A = temp;
	    }

	    for (i = 60; i <= 79; i++) {
	      temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
	      E = D;
	      D = C;
	      C = rotate_left(B, 30);
	      B = A;
	      A = temp;
	    }

	    H0 = (H0 + A) & 0x0ffffffff;
	    H1 = (H1 + B) & 0x0ffffffff;
	    H2 = (H2 + C) & 0x0ffffffff;
	    H3 = (H3 + D) & 0x0ffffffff;
	    H4 = (H4 + E) & 0x0ffffffff;
	  }

	  temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
	  return temp.toLowerCase();
};

function utf8_encode(argString) {
  //  discuss at: http://phpjs.org/functions/utf8_encode/
  // original by: Webtoolkit.info (http://www.webtoolkit.info/)
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: sowberry
  // improved by: Jack
  // improved by: Yves Sucaet
  // improved by: kirilloid
  // bugfixed by: Onno Marsman
  // bugfixed by: Onno Marsman
  // bugfixed by: Ulrich
  // bugfixed by: Rafal Kukawski
  // bugfixed by: kirilloid
  //   example 1: utf8_encode('Kevin van Zonneveld');
  //   returns 1: 'Kevin van Zonneveld'

  if (argString === null || typeof argString === 'undefined') {
    return '';
  }

  var string = (argString + ''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  var utftext = '',
    start, end, stringl = 0;

  start = end = 0;
  stringl = string.length;
  for (var n = 0; n < stringl; n++) {
    var c1 = string.charCodeAt(n);
    var enc = null;

    if (c1 < 128) {
      end++;
    } else if (c1 > 127 && c1 < 2048) {
      enc = String.fromCharCode(
        (c1 >> 6) | 192, (c1 & 63) | 128
      );
    } else if ((c1 & 0xF800) != 0xD800) {
      enc = String.fromCharCode(
        (c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
      );
    } else { // surrogate pairs
      if ((c1 & 0xFC00) != 0xD800) {
        throw new RangeError('Unmatched trail surrogate at ' + n);
      }
      var c2 = string.charCodeAt(++n);
      if ((c2 & 0xFC00) != 0xDC00) {
        throw new RangeError('Unmatched lead surrogate at ' + (n - 1));
      }
      c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
      enc = String.fromCharCode(
        (c1 >> 18) | 240, ((c1 >> 12) & 63) | 128, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
      );
    }
    if (enc !== null) {
      if (end > start) {
        utftext += string.slice(start, end);
      }
      utftext += enc;
      start = end = n + 1;
    }
  }

  if (end > start) {
    utftext += string.slice(start, stringl);
  }

  return utftext;
}



