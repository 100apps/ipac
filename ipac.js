#!/usr/bin/env node

var http = require('http');
var fs = require('fs');
var ipac = {
	port: process.argv.length>2&&parseInt(process.argv[2])?parseInt(process.argv[2]):55555,//服务器端口号
	useCloudflareHttps: process.argv.length>3&&process.argv[3]=="true"?true:false, //可以根据自己的情况修改。是否使用cloudflare并强制使用https
	hostsStr: "",
	lastUpdateTime: 0,
	count: 0,
	//解析gfwtest.js,去除多余路径和规则，只留下host，并且保存到当前目录的hosts文件
	parseGfwtest: function(str) {
		str = new Buffer(/decode64\("(.*?)"\)/.exec(str)[1], 'base64').toString('ascii').split("\n");
		var hosts = {};
		for (var i = 0; i < str.length; i++) {
			if (str[i].indexOf("return PROXY") == -1)
				continue;
			var host = /\/(.*?)\/i\.test/.exec(str[i]);
			if (host) {
				host = host[1].replace(/\\/g, "");
				host = host.replace('^[w-]+:/+(?!/)(?:[^/]+.)?', '');
				host = host.replace('^http://', '');
				host = host.replace('^https://', '');
				host = host.replace('.*.', '.');
				if (host.indexOf('/') > 0) host = host.substr(0, host.indexOf('/'));
				if (host.indexOf('%') > 0) host = host.substr(0, host.indexOf('%'));
				if (host.indexOf('*') > 0) host = host.substr(0, host.indexOf('*'));
				if (host.charAt(0) == '.') host = host.substr(1);
				if (host.charAt(host.length - 1) == '.') host = host.substr(0, host.length - 1);
				if (host.indexOf(".") == -1 || host.indexOf("'") > -1 || host.indexOf('"') > -1) continue;
				hosts[host] = 1;
			}
		}
		var ret = ""
		for (var host in hosts) {
			ret += ",'" + host + "'";
		}
		ret = "[" + (ret.substr(1)) + "]";
		return "var _encodedHosts='" + (new Buffer(ret, encoding = 'utf8').toString("base64")) + "';\n";
	},
	date2timestamp: function(date) {
		return Math.round((date ? date.getTime() : new Date().getTime()) / 1000);
	},
	reload: function() {
		if (this.date2timestamp(new Date()) - this.lastUpdateTime < 12 * 3600) return;
		var ipac = this;
		console.log("开始请求gfwtest.js");
		require("https" /*如果是http请求，请改成http*/ ).request({
			host: 'raw.githubusercontent.com',
			path: '/100apps/ipac/master/gfwtest.js'
		}, function(response) {
			var str = ''
			response.on('data', function(chunk) {
				str += chunk;
			});
			response.on('end', function() {
				if (ipac.lastUpdateTime == 0) {
					ipac.startServer();
				};
				ipac.hostsStr = ipac.parseGfwtest(str);
				ipac.lastUpdateTime = ipac.date2timestamp(new Date());

			});
			response.on('error', function(e) {
				console.error(e);
			});
		}).end();
	},
	startServer: function() {
		var ipac = this;
		http.createServer(function(req, res) {
			//对于cloudflare，强制开启https
			if (ipac.useCloudflareHttps) {
				if (!req.headers.hasOwnProperty("cf-visitor")) {
					res.writeHead(301, {
						'Location': 'https://www.baidu.com/'
					});
					res.end();
					return;
				} else if (req.headers["cf-visitor"].indexOf("https") == -1) {
					res.writeHead(301, {
						'Location': 'https://' + req.headers["host"] + req.url
					});
					res.end();
					return;
				}
			}

			console.log((ipac.count++) + "\t" + req.url + "\t" + req.connection.remoteAddress+(req.headers.hasOwnProperty("x-forwarded-for")?"/"+req.headers["x-forwarded-for"]:"") + "\t" + req.headers["user-agent"]);
			ipac.reload(); //reload
			var url = req.url.toLowerCase();
			var px = "";
			if (url.substr(0, 6) == "/socks") px = "SOCKS " + url.substr(6) + "; DIRECT";
			if (url.substr(0, 6) == "/proxy") px = "PROXY " + url.substr(6) + "; DIRECT";
			res.writeHead(200, {
				'Content-Type': 'application/x-ns-proxy-autoconfig; charset=utf-8'
			});
			if (px) {
				res.write("var _px='" + px + "';\n");
			};
			res.write(ipac.hostsStr);
			res.write(fs.readFileSync("template.pac"));
			res.end();
		}).listen(this.port, '0.0.0.0');
		var serverURL = 'http://127.0.0.1:' + this.port + "/";
		console.log('Server running at ' + serverURL + "\n您可以配置template.pac设置默认代理／增加自定义规则\n也可以通过url定制代理。比如:\n\t" + serverURL + "socks8.8.8.8:88 指定使用socks://8.8.8.8:88代理\n\t或者\n\t" + serverURL + "proxy8.8.8.8:88 指定使用http://8.8.8.8:88代理");
	},
};

ipac.reload();
