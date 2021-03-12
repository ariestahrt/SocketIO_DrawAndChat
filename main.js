// Ref https://socket.io/docs/v3/server-api/index.html

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const { Socket } = require('socket.io');

const port = process.env.PORT || 1337;
app.set('port', port);
server.listen(port, () => console.log('listening on port http://127.0.0.1:' + port));

const password = '12345';

// Setup view engine

// Set Render File .extentions
app.set('view engine', 'ejs');

// Set Default Render File Assets
app.set('views', path.join(__dirname, '/assets/render'));

// Set Default Static Assets
app.use(express.static(path.join(__dirname, '/assets/static')));

const endpoint = ['Bebas', 'Admin Only', 'View Only'];

endpoint.map(ep => io.of(`/${ep}`)).forEach(ep => {

    // Key value as socket.id
    let users = {};

    ep.on('connection', (socket) =>{
        
        console.log('new connection: ' + socket.id);

        // User masuk
        socket.on('login', (name) => {
            console.log('login', name);

            users[socket.id] = name;

            // Tell everyone
            console.log('Sending to all');
            socket.broadcast.emit('msg', {
                from: 'server',
                message: `${name} logged in.`
            });
        });

        // Pesan masuk
        socket.on('msg', (message) => {
            console.log('msg', message);

            // Tell everyone
            socket.broadcast.emit('msg', {
                from: users[socket.id],
                message: message
            });

            // Tell sender
            socket.emit('msg', {
                from: users[socket.id],
                message: message
            });
        });

        // User DC

        socket.on('disconnect', (message) => {
            // Cari socket idnya
            let name;
            if(socket.id in users) {
                name = users[socket.id]
            }else{
                name = socket.id
            }

            console.log('user disconnect: ', name);

            // Tell everyone
            socket.broadcast.emit('msg', {
                from: 'server',
                message: `${name} disconnected.`
            });

            // Hapus socket.id dari map users 
            delete users[socket.id]
        });

        // Drawing
        socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
    });
});

// Fungsi validasi

function validation(room, params){
    if(room == 'Admin Only'){
        if(params.password == '12345'){
            return true;
        }
        return false;
    }
}

// Routes

app.get('/route', (req,res) => {
    res.render('route', {
        endpoint: endpoint
    });
});

// Index
app.get('/', (req,res) => {
    res.redirect('/route')
});

// Setiap Endpoint
app.get('/draw/:endpoint', (req,res) => {
    const ep = req.params['endpoint'];
    if(!endpoint.includes(ep)){
        return res.sendStatus(404);
    }

    res.render('draw');
});