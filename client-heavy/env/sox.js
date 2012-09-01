define(['SynerJ', "socket", 'eventHandlers'],
		function (SynerJ, io, eventHandlers) {
	
  var host1 = 'http://178.116.196.74:2290/'
	var host2 = 'http://localhost:2290/'
	
  SynerJ.socket = io.connect(host2);
	SynerJ.socket.on('connect', function () {
		SynerJ.socket.emit('auth', SynerJ.docName);
		SynerJ.socket.on('disconnect', function () {
			SynerJ.socket.emit('deauth', SynerJ.docName);
		});
		SynerJ.socket.on('error', function error(data) {
			console.log(data);
			alert(data.message);
		});
    SynerJ.socket.on('auth', function authed(data) {
      //SynerJ.initDevelopment();
    });
	});

  eventHandlers.initSocket(SynerJ.socket);

	return SynerJ; 
});
