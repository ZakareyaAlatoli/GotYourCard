const { createServer } = require('http');
const { Server } = require('socket.io');
const {
  generateUserId, 
  refreshUserId, 
  deleteIdleUserIds,
  setUsername,
  createRoom,
  getUsersById,
  removeUserFromRoom
} = require('./mongo');

const server = createServer();
const io = new Server(server, {
  cors: '*'
});

io.on('connection', socket => {
  //Listen for client messages
  socket.on('set-id', async () => {
    const userId = await generateUserId();
    socket.emit('set-id', userId);
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
  socket.on('create-room', async userId => {
    const room = await createRoom(userId);
    socket.emit('create-room', room);
  })
  socket.on('get-users', async userIds => {
    const users = await getUsersById(userIds);
    socket.emit('get-users', users);
  })
  socket.on('leave-room', async userId => {
    await removeUserFromRoom(userId);
  })
})

//TODO: maybe separate this from the game server?
setInterval(() => {
  deleteIdleUserIds();
}, 3_600_000);

server.listen(process.env.PORT || 3000);

