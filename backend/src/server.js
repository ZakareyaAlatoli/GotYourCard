const { createServer } = require('http');
const { Server } = require('socket.io');
const {
  generateUserId, 
  refreshUserId, 
  deleteIdleUserIds,
  setUsername,
  createRoom,
  getUsersById,
  removeUserFromRoom,
  joinRoom
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
    try{
      const username = await setUsername(userId, name);
      socket.emit('set-name', username);
    }
    catch(error){
      socket.emit('error', error);
    }
  })
  socket.on('create-room', async userId => {
    const room = await createRoom(userId);
    socket.emit('create-room', room);
  })
  socket.on('get-users', async userIds => {
    try{
      const users = await getUsersById(userIds);
      socket.emit('get-users', users);
    }
    catch(error){
      socket.emit('error', error);
    }
  })
  socket.on('leave-room', async userId => {
    try{
      await removeUserFromRoom(userId);
    }
    catch(error){
      socket.emit('error', error);
    }
  })
  socket.on('join-room', async (userId, roomId) => {
    try{
      const room = await joinRoom(userId, roomId);
      socket.emit('join-room', room);
    }
    catch(error){
      socket.emit('error', error);
    }
  })
})

//TODO: maybe separate this from the game server?
console.log('Purging idle accounts...');
deleteIdleUserIds();
setInterval(() => {
  console.log('Purging idle accounts...');
  deleteIdleUserIds();
}, 3_600_000);

server.listen(process.env.PORT || 3000);

