# ipac

[![Join the chat at https://gitter.im/100apps/ipac](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/100apps/ipac?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
hi, 墙内的人！

首先了解什么是PAC文件：<http://zh.wikipedia.org/zh/代理自动配置>

ipac根据[autoproxy2pac](http://autoproxy2pac.appspot.com/)的最新规则生成pac文件，适用于各种平台（pc／mac／iPhone等支持PAC自动代理的系统），这样我们就可以「自动翻墙」了。

ipac是一个web server，类似于<http://autoproxy2pac.appspot.com/>，可以根据参数生成pac文件，但是昨天（2015-03-26）我使用的时候这个网站已经不能生成pac文件了，幸好还有一个[gfwtest.js](http://autoproxy2pac.appspot.com/gfwtest.js)可以访问，所以`ipac`就是根据这个js文件生成pac格式文件的开源程序。

ipac并不是像[goagent](https://github.com/goagent/goagent)那样是一个代理软件，他只是一个规则，告诉系统(浏览器)什么时候用代理(翻墙)，什么时候不用。如果你想翻墙，代理软件还是需要的。

举个例子，我自己用一个美国的VPS当跳板，用ssh做代理。我在我自己的机器(iMac,ip:192.168.81.246)上，运行

	ssh -o GatewayPorts=yes -D 7071 -NT user@example.com

这样本机的7071端口就是一个socks代理了。注意因为用了`-o GatewayPorts=yes`参数，所以其他机器(比如我的iPhone)也能访问iMac上的7071端口了。如果你使用了其他代理软件比如tor，最终也是得到一个可以当（socks或者http）代理的端口。

我们以firefox为例，如果此时在`网络`->`设置`->`手动配置代理`->`SOCKS主机`处填写192.168.81.246:7071（注意勾选`远程DNS`选项），那么此时firefox全局都是使用代理的，但是访问baidu／qq／淘宝之类的国内网站不想用代理，此时`ipac`就派上用场了！

在firefox中，我们选择`网络`->`设置`->`自动代理配置（PAC）`中填入

	https://poiuy.me/socks192.168.81.246:7071

然后点击确定，这样firefox就能按需自动代理了。cool！

同样的，打开iPhone的`设置`->`Wi-Fi`->`ⓘ`->`HTTP代理`->`自动` 填入
	
	https://poiuy.me/socks192.168.81.246:7071

此时iPhone也能按需代理了。快来用Safari打开<https://www.twitter.com>试试吧！

上面的poiuy.me就是用ipac.js搭建的。我在一台美国的VPS上运行`./ipac.js 80`就启动了。ipac专门为[cloudflare](https://www.cloudflare.com/)做了优化，如果在ipac.js中把第7行的`useCloudflareHttps`值设置为true，那么就会强制使用cloudflare的https，而且如果不是cloudflare的请求就直接拒绝，使PAC服务器更安全，更隐蔽。

##ipac支持的参数
	
	https://poiuy.me/socks192.168.81.246:7071 #用192.168.81.246:7071的SOCKS代理
	https://poiuy.me/proxy192.168.81.246:7071 #用192.168.81.246:7071的HTTP代理

所以其实只支持两个参数，`socks`和`proxy`，后面跟的是`ip:port`。如果什么参数也不加，就返回(template.pac中定义的)默认代理`SOCKS 127.0.0.1:7070`，当然如果是自己运行的`ipac`，可以直接编辑`template.pac`修改。

##想添加自定义规则怎么办？
需要自己运行`ipac.js`，修改`template.pac`文件的`myHosts`变量，默认是追加hosts，可以通过`-host`来从gfwlist中减去某个host，比如`"-v2ex.com"`则对于gfwlist中的v2ex.com不用代理。

##chrome浏览器怎么使用
我可以负责任的告诉你，可以用！但是具体怎么用，请自行Google：`Chrome pac文件`，`Android pac文件`，`ie pac文件`等。

##我的服务器上运行了其他webserver，还可以跑ipac吗？
当然可以！ipac默认监听的是55555端口，比如你用nginx监听80端口，那么配置一个nginx的反向代理到127.0.0.1:5555即可。具体规则请Google：`nginx 反向代理`，`apache反向代理`等。

##现在这么多pac生成项目，你再弄一个有什么意义？
pac服务器，首先要保证能直接访问，不被墙。所以一个pac地址一旦出名，就会被墙，不如开源一个pac服务器，大家自建。可以用我们提供的，也可以自己本机搞一个，或者放在墙内的服务器上。

另外，如果你想分享自己的pac服务器，欢迎push过来。

--------------
One More Thing

ipac.js是用[nodejs](https://nodejs.org)写的，所以你要想运行ipac.js，请在自己的机器上安装nodejs，比如：

- yum install nodejs
- apt-get install nodejs
- brew install nodejs
- ...

--------------
One More Thing, NO Kidding

##不越狱的iPhone也能用ssh翻墙
我们首先从App Store下载一个ssh软件，比如我用的是[vSSH Lite](https://appsto.re/cn/iYe5F.i)，配置-D参数(端口转发／Port Forwarding->Dynamic)，比如7070，那么iPhone的127.0.0.1:7070就是一个socks代理了。此时填入自动代理规则地址`https://poiuy.me/`就可以了。但是默认情况下，大约10分钟iPhone上的ssh客户端就会停止，需要手动切一下到前台。

另外vSSH还支持`Accept all connections`，相当于ssh的`-o GatewayPorts=yes`， 其他设备(你的iPad／android手机，甚至电脑)也能用vSSH的socks代理了。可以打开`设置`->`Wi-Fi`查看你的iPhone的IP。

##poiuy.me这个域名好奇怪啊
都是为了输入方便。poiuy是iPhone（或其他手机设备）字母键盘最上面一行，从右向左的前5个字母😄，所以输入一次就记住了。

##楼主我看了你的代码，感觉你的js写得很烂
楼主是专职做iOS(Objective-C)开发的，javascript还处于学习阶段，写得不好，请见谅。但是，你想，好歹，这个东西它跑起来了！👏

##目前可用的ipac服务器地址：
1. https://poiuy.me/
2. 欢迎添加