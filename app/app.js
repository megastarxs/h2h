var express = require('express');
var app = express.createServer();
var io = require('socket.io').listen(app);
var port = 3001;
var sanitizer = require('./sanitizer');
var listener = {},venters = {};



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
    app.use('/assets',express.static(__dirname + '/assets'));
});

app.listen(port);

// Heroku setting for long polling - assuming io is the Socket.IO server object

io.configure(function() {
    io.set("transports", ["jsonp-polling","xhr-polling"]);
//  io.set("polling duration", 30);
//  io.set('heartbeat interval', 20);
//  io.set('heartbeat timeout', 60);
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




io.sockets.on('connection', function(socket) {

    socket.on('add_venter', function() {
        query_con("Venter", socket);
    });

    socket.on('add_listner', function() {
        query_con("Listener", socket);
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
        socket.broadcast.to(socket.room).emit('SERVER', socket.type + ' has disconnected');
        socket.broadcast.to(socket.room).emit('disc', socket.type);
        socket.leave(socket.room);
    });
});



function query_con(b, socket) {

var data,find_data,me;
var room_hex=socket.id;


if(b=="Venter")
{data=listener;me=venters;}
else
{me=listener;data=venters;}
me[socket.id] = '';





    for(i in data)
    {
        if(data[i]=='')
            {
                data[i]=room_hex;
                me[socket.id]=room_hex;
                room_hex=i;
                break;
            }
    }


    socket.room = room_hex;
    socket.type = b;
    socket.join(room_hex);
     var msg = 'You are now connected.<br>';
    if(room_hex==socket.id) {
        msg += 'Please wait while we connect you to your chat partner.';
        socket.emit('SERVER', msg);
    } else {
        socket.broadcast.to(room_hex).emit('SERVER', socket.type + ' has connected to this room');
        io.sockets. in (socket.room).emit('all_connected');
    }


    socket.emit('whoami', socket.type);
}