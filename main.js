
function getLocalIp(cb) {
	window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;   //compatibility for firefox and chrome
	var pc = new RTCPeerConnection({iceServers:[]}), noop = function(){};      
	pc.createDataChannel('');    //create a bogus data channel
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
	xhr.timeout = 2000;
	xhr.onload = function() {
		console.log(ip, xhr.status);
		cb(ip, xhr.status);
	};
	xhr.onerror = function(e) {
		var img = document.createElement('img');
		img.onload = function() {
		   console.log(ip + ' success');
		}
        img.setAttribute('src', 'http://'+ip+':'+port);		
		document.body.appendChild(img);
	}
	xhr.ontimeout = function () {
		console.log(ip, 'timeout');
	}
	xhr.open('GET', 'https://'+ip+':'+port);
	xhr.send();
}

function findServers(myIp, port, cb) {
	const split = myIp.split('.');
	const block = split[0];
	var clone = split.slice();
	for (var i = 0; i < 255; i++) {
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