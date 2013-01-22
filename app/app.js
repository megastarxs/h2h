var express = require('express');
var app = express.createServer();
var io = require('socket.io').listen(app);
var port = 3001;
var db = require('mongo-lite').connect('mongodb://localhost/test',["l_v"]);
var sanitizer = require('./sanitizer');



var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    next();
}

//...
app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'cool beans' }));
    app.use(express.methodOverride());
    app.use(express.logger());
    app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
    }));
    app.use(allowCrossDomain);
    app.use(app.router);
    app.use(express.static(__dirname + '/assets'));
});

app.listen(port);

// Heroku setting for long polling - assuming io is the Socket.IO server object

io.configure(function() {
	io.set("transports", ["jsonp-polling","xhr-polling"]);
//	io.set("polling duration", 30);
//	io.set('heartbeat interval', 20);
//	io.set('heartbeat timeout', 60);
	// io.set('close timeout', 10);
});


// routing
app.get('/', function(req, res) {
	res.sendfile(__dirname + '/index.html');
});

app.get('/mobile.html', function(req, res) {
	res.sendfile(__dirname + '/index.html');
});

app.get('/mini_stats', function(req, res) {
	var vc = Object.keys(venters).length;
	var lc = Object.keys(listener).length;
	var vent_count = vc > 0 ? '<span style="background-color: #c33; border: 1px solid #c33; border-radius: 4px; font-size: .9em; font-weight: bold; padding: 1px; padding-left: 4px; padding-right: 4px; margin-bottom: 1px;">' + vc + '</span>' : "";
	var list_count = lc > 0 ? '<span style="background-color: #c33; border: 1px solid #c33; border-radius: 4px; font-size: .9em; font-weight: bold; padding: 1px; padding-left: 4px; padding-right: 4px; margin-bottom: 1px;">' + lc + '</span>' : "";
	var body = "Listen"+list_count+'\\'+"Vent"+vent_count;

	res.writeHead(200, {
		'Content-Type': 'text/html; charset=UTF-8',
		"Content-Length": require('buffer').Buffer.byteLength(body)
	});
	res.write(body);
	res.end();
});

app.get('/status', function(req, res) {

	var body = JSON.stringify({
		listener: Object.keys(listener).length,
		venters: Object.keys(venters).length
	});
	res.writeHead(200, {
		'Content-Type': 'text/html; charset=UTF-8',
		"Content-Length": require('buffer').Buffer.byteLength(body)
	});
	res.write(body);
	res.end();
});



var listener = {},
	venters = {};
// rooms which are currently availableinchat
io.sockets.on('connection', function(socket) {

	console.log(listener,venters);
	socket.on('add_venter', function() {
		console.log(listener,venters);
		query_con("Venter", socket);
		venters[socket.id] = socket.id;
	});

	socket.on('add_listner', function() {
		query_con("Listener", socket);
		listener[socket.id] = socket.id;
	});

	socket.on('sendchat', function(data) {
		io.sockets. in (socket.room).emit('updatechat', socket.type, sanitizer.sanitize(data));
	});


    socket.on('good_l', function() {
        io.sockets. in (socket.room).emit('good_l', socket.type);
    });

    socket.on('bad_l', function() {
        io.sockets. in (socket.room).emit('bad_l', socket.type);
    });

	socket.on('starttyping', function() {
		socket.broadcast.to(socket.room).emit('starttypin', socket.type);
	});

	socket.on('stoptyping', function() {
		socket.broadcast.to(socket.room).emit('stoptypin', socket.type);
	});



	socket.on('disconnect', function() {
		delete listener[socket.id];
		delete venters[socket.id];
		db.l_v.remove({$or:[{l:socket.id},{v:socket.id}]}, function(err){})
		socket.broadcast.to(socket.room).emit('SERVER', socket.type + ' has disconnected');
		socket.broadcast.to(socket.room).emit('disc', socket.type);
		socket.leave(socket.room);
	});
});



function query_con(b, socket) {
var data,find_data;


if(b=="Venter")
{data={v:socket.id};
find_data={v:null,l:{$ne:null}};}
else
{data={l:socket.id};
find_data={l:null,v:{$ne:null}};}
db.l_v.find(find_data).first(function(err, doc){
    if(doc!=null)
    {room_set(doc._id,socket,b,false);
    db.l_v.remove({_id: doc._id}, function(err){})}
    else
    db.l_v.insert(data, function(err, doc){
    room_set(doc._id,socket,b,true);
    });
})
}

function room_set(room_hex,socket,b,stats) {
    socket.room = room_hex;
    socket.type = b;
    socket.join(room_hex);
    var msg = 'You are now connected.<br>';
    if(stats) {
        msg += 'Please wait while we connect you to your chat partner.';
        socket.emit('SERVER', msg);
    } else {
        socket.broadcast.to(room_hex).emit('SERVER', socket.type + ' has connected to this room');
        io.sockets. in (socket.room).emit('all_connected');
    }
    socket.emit('whoami', socket.type);
}