const { createServer } = require('http');
const { Server } = require('socket.io');
const mongo = require('./mongo');
const {Screens} = require('./AppConstants');

const server = createServer();
const io = new Server(server, {
  cors: '*'
});

//TODO: should userId be validated every time a socket message is sent?
io.on('connection', socket => {
  //Listen for client messages
  socket.on('set-id', async () => {
    const userId = await mongo.generateUserId();
    socket.emit('set-id', userId);
  });
  socket.on('refresh', async userId => {
    const {matchedCount} = await mongo.refreshUserId(userId);
    if(matchedCount == 0){
      const newId = await mongo.generateUserId();
      socket.emit('set-id', newId);
      return;
    }
    const [user] = await mongo.getUsersById([userId]);
    socket.emit('set-name', user.name);
    //If we are here then the user exists and we must reset them
    //to the proper game state
    const existingRoom = await mongo.getRoomByUserId(userId);
    if(existingRoom){
      socket.join(existingRoom._id.toString());
      socket.emit('room-players-change', existingRoom);
      socket.emit('set-screen', existingRoom.phase);
    }
  })
  socket.on('set-name', async (userId, name) => {
    try{
      const username = await mongo.setUsername(userId, name);
      socket.emit('set-name', username);
    }
    catch(error){
      socket.emit('error', error);
    }
  })
  socket.on('create-room', async userId => {
    try{
      const existingRoom = await mongo.getRoomByUserId(userId);
      if(existingRoom) 
        throw('User is already in a room');
      const room = await mongo.createRoom(userId);
      socket.join(room._id.toString());
      socket.emit('create-room', room);
    }
    catch(error){
      socket.emit('error', 'Cannot create room');
    }
  })
  socket.on('get-users', async userIds => {
    try{
      const users = await mongo.getUsersById(userIds);
      socket.emit('get-users', users);
    }
    catch(error){
      socket.emit('error', error);
    }
  })
  socket.on('leave-room', async userId => {
    try{
      const [user] = await mongo.getUsersById([userId]);
      if(user == null)
        throw('User does not exist');
      await mongo.removeUserFromRoom(userId);
      const roomId = user?.roomId;
      if(roomId){
        socket.leave(roomId.toString());
        const room = await mongo.getRoomById(roomId);
        io.to(roomId.toString()).emit('room-players-change', room);
      }
    }
    catch(error){
      socket.emit('error', 'Cannot leave room');
    }
  })
  socket.on('join-room', async (userId, roomId) => {
    try{
      const existingRoom = await mongo.getRoomByUserId(userId);
      if(existingRoom) 
        throw('User is already in a room');
      const room = await mongo.joinRoom(userId, roomId);
      socket.join(roomId);
      socket.emit('join-room', room);
      io.to(roomId).emit('room-players-change', room);
    }
    catch(error){
      socket.emit('error', error);
    }
  })
  socket.on('start-game', async (userId) => {
    try{
      const [user] = await mongo.getUsersById([userId]);
      if(user == null)
        throw('User does not exist');
      const roomId = user?.roomId;
      if(roomId){
        await mongo.startGame(roomId);
        io.to(roomId.toString()).emit('question-phase');
      }
    }
    catch(error){
      socket.emit('error', error);
    }
  })
  socket.on('set-question', async (userId, question) => {
    try{
      const askedQuestion = await mongo.setQuestion(userId, question);
      socket.emit('set-question', askedQuestion);
      const room = await mongo.getRoomByUserId(userId);
      const questions = await mongo.getQuestionsByRoomId(room._id.toString());
      if(room.memberUserIds.length == questions.length){
        await mongo.setRoomPhase(room._id.toString(), Screens.ANSWER);
        io.to(room._id.toString()).emit('set-screen', Screens.ANSWER);
      }
    }
    catch(error){
      socket.emit('error', 'Could not send question');
    }
  })
})

//TODO: maybe separate this from the game server?
setInterval(() => {
  console.log('Purging idle accounts...');
  mongo.deleteIdleUserIds();
}, 3_600_000);

server.listen(process.env.PORT || 3000);

