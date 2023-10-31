const { createServer } = require('http');
const { Server } = require('socket.io');

const server = createServer();
const io = new Server(server, {
  cors: '*'
});

var pidtosid = {}//We keep track of these to because the socket id
var sidtopid = {}//of a player can change because of reconnects

io.on('connection', socket => {
  console.log(`${socket.handshake.address} connected`);
  //This is only emitted when a client connects
  socket.emit('get-pid');
  //Listen for client messages
  socket.on('get-pid', (pid) => {
    pidtosid[pid] = socket.id;
    sidtopid[socket.id] = pid;
  })
})

server.listen(process.env.PORT || 3000);
