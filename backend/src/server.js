const { createServer } = require('http');
const { Server } = require('socket.io');
const {
  generateUserId, 
  refreshUserId, 
  deleteIdleUserIds,
  setUsername,
  createRoom,
  getUsersById,
  getRoomById,
  removeUserFromRoom,
  joinRoom,
  startGame,
  getRoomByUserId
} = require('./mongo');
const {Screens} = require('./AppConstants');

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
      return;
    }
    const [user] = await getUsersById([userId]);
    socket.emit('set-name', user.name);
    //If we are here then the user exists and we must reset them
    //to the proper game state
    const existingRoom = await getRoomByUserId(userId);
    if(existingRoom){
      socket.emit('set-screen', existingRoom.phase);
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
    try{
      const existingRoom = await getRoomByUserId(userId);
      if(existingRoom) 
        throw('User is already in a room');
      const room = await createRoom(userId);
      socket.join(room._id.toString());
      socket.emit('create-room', room);
    }
    catch(error){
      socket.emit('error', 'Cannot create room');
    }
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
        io.to(roomId.toString()).emit('room-players-change', room);
      }
    }
    catch(error){
      socket.emit('error', 'Cannot leave room');
    }
  })
  socket.on('join-room', async (userId, roomId) => {
    try{
      const existingRoom = await getRoomByUserId(userId);
      if(existingRoom) 
        throw('User is already in a room');
      const room = await joinRoom(userId, roomId);
      socket.join(roomId);
      socket.emit('join-room', room);
      io.to(roomId).emit('room-players-change', room);
    }
    catch(error){
      console.error(error);
      socket.emit('error', error);
    }
  })
  socket.on('start-game', async (userId) => {
    try{
      const [user] = await getUsersById([userId]);
      if(user == null)
        throw('User does not exist');
      const roomId = user?.roomId;
      if(roomId){
        await startGame(roomId);
        io.to(roomId.toString()).emit('question-phase');
      }
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

