
function getLocalIp(cb) {
	window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;   //compatibility for firefox and chrome
	var pc = new RTCPeerConnection({iceServers:[]}), noop = function(){};      
	pc.createDataChannel("");    //create a bogus data channel
	pc.createOffer(pc.setLocalDescription.bind(pc), noop);    // create offer and set local description
	pc.onicecandidate = function(ice){  //listen for candidate events
		if(!ice || !ice.candidate || !ice.candidate.candidate) {
			cb(null);
			return;
		}
		var myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
		pc.onicecandidate = noop;
		cb(myIP);
	};
}


function attemptConnection(ip, port, cb) {
	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		cb(ip, xhr.status);
	};
	xhr.open("GET", "http://"+ip+":"+port);
	try {
		xhr.send();
	} catch (e) {
		cb(ip, 200);
	}
}

function findServers(myIp, port, cb) {
	const split = myIp.split('.');
	const block = split[0];
	var clone = split.slice();
	for (var i = 0; i <= 255; i++) {
		clone[3] = i;
		var testIp = clone.join('.');
		
		attemptConnection(testIp, port, function(ip, status) {
			if (status == 200) {
				cb(ip);
			}
		});
	}
}

getLocalIp(function (local) {
	document.getElementById('my-ip-address').innerText = local;
	if (local != null) {
		findServers(local, 5440, function(ip) {
			document.getElementById('server-ip-address').innerText = ip;
		});
	}
});