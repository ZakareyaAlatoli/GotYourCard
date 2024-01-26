const { createServer } = require('http');
const { Server } = require('socket.io');
const {ObjectId} = require('mongodb');
const {
  generateUserId, 
  refreshUserId, 
  deleteIdleUserIds,
  setUsername,
  createRoom,
  getUsersById,
  getRoomById,
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
  socket.on('refresh', async userId => {
    const {matchedCount} = await refreshUserId(userId);
    if(matchedCount == 0){
      const newId = await generateUserId();
      socket.emit('set-id', newId);
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
    socket.join(room._id.toString());
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
      const [user] = await getUsersById([userId]);
      if(user == null)
        throw('User does not exist');
      await removeUserFromRoom(userId);
      const roomId = user?.roomId;
      if(roomId){
        socket.leave(roomId.toString());
        const room = await getRoomById(roomId);
        io.to(roomId.toString()).emit('room-change', room);
      }
    }
    catch(error){
      socket.emit('error', 'Cannot leave room');
    }
  })
  socket.on('join-room', async (userId, roomId) => {
    try{
      const room = await joinRoom(userId, roomId);
      socket.join(roomId);
      socket.emit('join-room', room);
      io.to(roomId).emit('room-change', room);
    }
    catch(error){
      socket.emit('error', error);
    }
  })
})

//TODO: maybe separate this from the game server?
setInterval(() => {
  console.log('Purging idle accounts...');
  deleteIdleUserIds();
}, 3_600_000);

server.listen(process.env.PORT || 3000);

