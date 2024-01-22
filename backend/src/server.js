const { createServer } = require('http');
const { Server } = require('socket.io');
const {
  generateUserId, 
  refreshUserId, 
  deleteIdleUserIds,
  setUsername
} = require('./mongo');

const server = createServer();
const io = new Server(server, {
  cors: '*'
});

io.on('connection', socket => {
  //Listen for client messages
  socket.on('request-id', async () => {
    const userId = await generateUserId();
    socket.emit('receive-id', userId);
  });
  socket.on('refresh-id', async userId => {
    const {matchedCount} = await refreshUserId(userId);
    if(matchedCount == 0){
      const newId = await generateUserId();
      socket.emit('receive-id', newId);
    }
  })
  socket.on('set-name', async (userId, name) => {
    const username = await setUsername(userId, name);
    socket.emit('set-name', username);
  })
})

//TODO: maybe separate this from the game server?
setInterval(() => {
  deleteIdleUserIds();
}, 3_600_000);

server.listen(process.env.PORT || 3000);

