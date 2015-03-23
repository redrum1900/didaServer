var mongoose = require('mongoose');

var isDev = true,
	host = isDev?"localhost":"mongo.duapp.com",
	port = isDev?"27017":"8908",
	username = isDev?"":"Iir1u771udgSV8rGmUilllGG",
	password = isDev?"":"WxHDc7r1LrNksnPWZxTUaBTQbNpUGUHv",
	dbName = isDev?"dida":"IhQDrHnEkqWjoSLWCExn",
	url = "mongodb://" + username + ":" + password + "@" + host + ":" + port + "/" + dbName;

var recon = true;

function getConnect() {
	var opts = {
		db: {
			native_parser: true
		},
		server: {
			poolSize: 5,
			auto_reconnect: true
		},
		user: username,
		pass: password
	};

	mongoose.connect(url, opts);
	var dbcon = mongoose.connection;

	dbcon.on('error', function(error) {
		console.log('connection error');

		dbcon.close();
	});

	//监听关闭事件并重连
	dbcon.on('disconnected', function() {
		console.log('disconnected');
		dbcon.close();
	});
	dbcon.on('open', function() {
		console.log('connection success open');
		recon = true;
	});
	dbcon.on('close', function(err) {
		console.log('closed');

		reConnect('*');
	});

	function reConnect(msg) {
		console.log('reConnect' + msg);
		if (recon) {
			console.log('reConnect-**');
			dbcon.open(host, dbName, port, opts, function() {
				console.log('closed-opening');
			});
			recon = false;
			console.log('reConnect-***');
		};
		console.log('reConnect-end');
	}
}

exports.getConnect = getConnect; //包含到module.exports对象中,
// 如果module.exports中包含属性或方法则export.XX将被忽略
// Module.exports才是真正的接口，exports只不过是它的一个辅助工具。
// 最终返回给调用的是Module.exports而不是exports。
// 所有的exports收集到的属性和方法，都赋值给了Module.exports。
// 当然，这有个前提，就是Module.exports本身不具备任何属性和方法。
// 如果，Module.exports已经具备一些属性和方法，那么exports收集来的信息将被忽略。
//module.exports = getConnection;//直接导出这个对象
exports.mongoose = mongoose;