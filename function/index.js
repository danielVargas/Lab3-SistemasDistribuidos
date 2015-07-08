//Función Javascript
var serverIP = 'localhost';
var port = 3000;
var users = new Array();

try {
	socket = io.connect(serverIP+':'+port+'/'); //Conexion con Socket.io

	socket.on('cargarTodos', function (data){
		$('#tablaListarTodos').append('<tr><td>'+ data["_id"]+'</td><td>'+ data["nombre"]+'</td><td>'+ data["apellidoP"]+'</td><td>'+ data["apellidoM"]+'</td><td>'+ data["e-mail"]+'</td><td>'+ data["universidad"]+'</td><td>'+ data["carrera"]+'</td><td>'+ data["años"]+'</td></tr>');
	});


	socket.on('cargarTodosUSACH', function (data){
		$('#tablaListarUSACH').append('<tr><td>'+ data["_id"]+'</td><td>'+ data["nombre"]+'</td><td>'+ data["apellidoP"]+'</td><td>'+ data["apellidoM"]+'</td><td>'+ data["e-mail"]+'</td><td>'+ data["universidad"]+'</td><td>'+ data["carrera"]+'</td><td>'+ data["años"]+'</td></tr>');
	});

	socket.on('cargarTodosPRIMER', function (data){
		$('#tablaListarPrimer').append('<tr><td>'+ data["_id"]+'</td><td>'+ data["nombre"]+'</td><td>'+ data["apellidoP"]+'</td><td>'+ data["apellidoM"]+'</td><td>'+ data["e-mail"]+'</td><td>'+ data["universidad"]+'</td><td>'+ data["carrera"]+'</td><td>'+ data["años"]+'</td></tr>');
	});


	socket.on('cargarEstudiantes', function (data){
		
		$('#sala').append('<option value="'+ data["_id"]+'">'+ data["nombre"]+'</option>');
	});
	


	socket.on('actualizarBusquedaNombre', function (data){
		$('#tablaSearchByName').append('<tr><td>'+ data["_id"]+'</td><td>'+ data["nombre"]+'</td><td>'+ data["apellidoP"]+'</td><td>'+ data["apellidoM"]+'</td><td>'+ data["e-mail"]+'</td><td>'+ data["universidad"]+'</td><td>'+ data["carrera"]+'</td><td>'+ data["años"]+'</td></tr>');
	});


	socket.on('actualizarBusquedaapellidoP', function (data){
		$('#tablaSearchBySurname').append('<tr><td>'+ data["_id"]+'</td><td>'+ data["nombre"]+'</td><td>'+ data["apellidoP"]+'</td><td>'+ data["apellidoM"]+'</td><td>'+ data["e-mail"]+'</td><td>'+ data["universidad"]+'</td><td>'+ data["carrera"]+'</td><td>'+ data["años"]+'</td></tr>');
	});

	socket.on('actualizarFormulario', function (data){

		$('#rut').val("");
		$('#nombre').val("");
		$('#apellidoP').val("");
		$('#apellidoM').val("");
		$('#email').val("");
		$('#universidad').val("");
		$('#carrera').val("");
		$('#años').val("");


		$('#rut').val(data["_id"]);
		$('#nombre').val(data["nombre"]);
		$('#apellidoP').val(data["apellidoP"]);
		$('#apellidoM').val(data["apellidoM"]);
		$('#email').val(data["e-mail"]);
		$('#universidad').val(data["universidad"]);
		$('#carrera').val(data["carrera"]);
		$('#años').val(data["años"]);

	});

}
catch (err) {
	alert('No está disponible el servidor Node.js');
}




$(function() {

	$('#listartodosbtn').ready(function() {
		
		socket.emit('listarTodosBtn', {});
	});

	$('#listarUSACHbtn').ready(function() {
		
		socket.emit('listarUsachBtn', {});
	});	
	$('#listarPrimerbtn').ready(function() {
		
		socket.emit('listarPrimerBtn', {});
	});	

	$('#btnSearchByName').click(function() {
		$('#tablaSearchByName').html("");	
		var nombre  = $('#busquedaNombre').val();
		socket.emit('SearchByName', { text: nombre });
	});	
	$('#btnSearchBySurname').click(function() {
		$('#tablaSearchBySurname').html("");	
		var apellido  = $('#busquedaApellido').val();
		socket.emit('SearchBySurname', { text: apellido });
	});

	
});


$(document).ready(function(){
		
		socket.emit('initRoom',{});

		$('#sala').change(function () {
	    var x = document.getElementById("sala").value;
		socket.emit('actualizaModificar', { text: x });

		
		});

});