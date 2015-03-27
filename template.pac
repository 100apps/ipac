/******默认代理和自定义规则可以在下面两行中配置：******/
var px=typeof _px !="undefined"&&_px?_px:"SOCKS 127.0.0.1:7070; DIRECT";//自定义默认proxy：1. http代理->PROXY host:port 2. socks代理-> SOCKS host:port
var myHosts=["google.com","google.com.hk"];//自定义规则.放在一个数组里。比如["a.com","b.com"]
var encodedHosts=typeof _encodedHosts !="undefined"?_encodedHosts:"";

function decode64(_1) {
	var _2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var _3 = "";
	var _4, _5, _6;
	var _7, _8, _9, _a;
	var i = 0;
	_1 = _1.replace(/[^A-Za-z0-9\+\/\=]/g, "");
	do {
		_7 = _2.indexOf(_1.charAt(i++));
		_8 = _2.indexOf(_1.charAt(i++));
		_9 = _2.indexOf(_1.charAt(i++));
		_a = _2.indexOf(_1.charAt(i++));
		_4 = (_7 << 2) | (_8 >> 4);
		_5 = ((_8 & 15) << 4) | (_9 >> 2);
		_6 = ((_9 & 3) << 6) | _a;
		_3 = _3 + String.fromCharCode(_4);
		if (_9 != 64) {
			_3 = _3 + String.fromCharCode(_5);
		}
		if (_a != 64) {
			_3 = _3 + String.fromCharCode(_6);
		}
	} while (i < _1.length);
	return _3;
}
var hosts=eval(decode64(encodedHosts));
if(myHosts&&myHosts.length)
	for(var i=0;i<myHosts.length;i++)
		hosts.push(myHosts[i]);

var hostsObj={};
for(var i=0;i<hosts.length;i++){
	hostsObj[hosts[i]]=true;
	hosts[i]="."+hosts[i];
}

function FindProxyForURL(url, host) {
	url = url.toLowerCase();
	host = host.toLowerCase();
	if(hostsObj[host])return px;
	for(var i=0;i<hosts.length;i++){
		if(host.substr(host.length-hosts[i].length)==hosts[i])
			return px;
	}
	return "DIRECT";
}
