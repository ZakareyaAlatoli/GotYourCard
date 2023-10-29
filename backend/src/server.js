const { createServer } = require('http');
const { Server } = require('socket.io');
const { attachSocketMessages } = require('./socket');
const redis = require('redis');
require('dotenv').config()

server = createServer();
const io = new Server(server, {
  cors: '*'
});

attachSocketMessages(io);
server.listen(process.env.PORT || 3000);
