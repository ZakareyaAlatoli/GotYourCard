const { createServer } = require('http');
const mongo = require('./mongo');
const {Screens} = require('./AppConstants');

const server = createServer();
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN,
    methods: ["GET", "POST"]
  }
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
      socket.emit('set-screen', Screens.MENU);
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
      socket.emit('set-screen-immediate', existingRoom.phase);
    }
    else{
      socket.emit('set-screen-immediate', Screens.MENU);
    }
  })
  socket.on('set-name', async (userId, name) => {
    try{
      const username = await mongo.setUsername(userId, name);
      socket.emit('set-name', username);
    }
    catch(error){
      console.error(error);
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
      console.error(error);
      socket.emit('error', error);
    }
  })
  socket.on('get-users', async userIds => {
    try{
      const users = await mongo.getUsersById(userIds);
      socket.emit('get-users', users);
    }
    catch(error){
      console.error(error);
      socket.emit('error', error);
    }
  })
  socket.on('leave-room', async userId => {
    try{
      const [user] = await mongo.getUsersById([userId]);
      if(user == null)
        throw('User does not exist');
      await mongo.removeUserFromRoom(userId);
      await mongo.deleteUserGameData([userId]);
      const roomId = user?.roomId;
      if(roomId){
        socket.leave(roomId.toString());
        const room = await mongo.getRoomById(roomId);
        io.to(roomId.toString()).emit('room-players-change', room);
      }
      socket.emit('set-screen', Screens.MENU);
    }
    catch(error){
      console.error(error);
      socket.emit('error', error);
    }
  })
  socket.on('join-room', async (userId, roomId) => {
    try{
      let existingRoom = await mongo.getRoomByUserId(userId);
      if(existingRoom) 
        throw('User is already in a room');
      existingRoom = await mongo.getRoomById(roomId);
      if(existingRoom.phase !== Screens.LOBBY && existingRoom.phase !== Screens.RESULTS)
        throw('Game is already in progress');
      const room = await mongo.joinRoom(userId, roomId);
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
      const room = await mongo.getRoomByUserId(userId);
      if(room == null)
        throw('User is not in a room');
      const roomId = room._id;
      if(room.owner.toString() != userId)
        throw('Only the room owner can start the game');
      if(room.memberUserIds.length < 3)
        throw('At least 3 players are needed to start a game');
      await mongo.deleteResults(roomId);
      await mongo.startGame(roomId);
      io.to(roomId.toString()).emit('set-screen', Screens.QUESTION);
    }
    catch(error){
      console.error(error);
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
      console.error(error);
      socket.emit('error', error);
    }
  })
  socket.on('get-questions', async (userId) => {
    try{
      const {_id} = await mongo.getRoomByUserId(userId);
      const questions = await mongo.getQuestionsByRoomId(_id.toString());
      socket.emit('get-questions', questions);
    }
    catch(error){
      console.error(error);
      socket.emit('error', error);
    }
  })
  socket.on('set-answers', async (userId, answers) => {
    try{
      await mongo.setAnswers(userId, answers);
      socket.emit('set-answers');
      const room = await mongo.getRoomByUserId(userId);
      const roomAnswers = await mongo.getAnswersByRoomId(room._id.toString());
      if(room.memberUserIds.length == roomAnswers.length){
        await mongo.setRoomPhase(room._id.toString(), Screens.MATCH);
        io.to(room._id.toString()).emit('set-screen', Screens.MATCH);
      }
    }
    catch(error){
      console.error(error);
      socket.emit('error', error);
    }
  })
  socket.on('get-answers', async (userId) => {
    try{
      const {_id} = await mongo.getRoomByUserId(userId);
      const answers = await mongo.getAnswersByRoomId(_id.toString());
      socket.emit('get-answers', answers);
    }
    catch(error){
      console.error(error);
      socket.emit('error', error);
    }
  })
  socket.on('set-matches', async (userId, matches) => {
    try{
      await mongo.setMatches(userId, matches);
      socket.emit('set-matches');
      const room = await mongo.getRoomByUserId(userId);
      const roomMatches = await mongo.getMatchesByRoomId(room._id.toString());
      if(room.memberUserIds.length == roomMatches.length){
        await mongo.setRoomPhase(room._id.toString(), Screens.RESULTS);
        io.to(room._id.toString()).emit('set-screen', Screens.RESULTS);
      }
    }
    catch(error){
      console.error(error);
      socket.emit('error', error);
    }
  })
  socket.on('get-matches', async (userId) => {
    try{
      const {_id} = await mongo.getRoomByUserId(userId);
      const matches = await mongo.getMatchesByRoomId(_id.toString());
      socket.emit('get-matches', matches);
    }
    catch(error){
      console.error(error);
      socket.emit('error', error);
    }
  })
  socket.on('get-results', async (userId) => {
    try{
      const {_id} = await mongo.getRoomByUserId(userId);
      const room = await mongo.getRoomByUserId(userId);
      let results = await mongo.getResultsByRoomId(_id.toString());
      if(results == null){
        if(room.phase == Screens.RESULTS)
          await mongo.setResults(_id.toString());
        else 
          throw('Cannot retrieve results for unfinished game');
      }
      else{
        await mongo.resetRoom(_id.toString());
      }
      results = await mongo.getResultsByRoomId(_id.toString());
      socket.emit('get-results', results);
    }
    catch(error){
      console.error(error);
      socket.emit('error', error);
    }
  })
})


//TODO: maybe separate this from the game server?
setInterval(async () => {
  console.log('Purging idle accounts...');
  try{
    await mongo.deleteIdleUserIds();
  }
  catch(error){
    console.error(error);
  }
}, 3_600_000);

server.listen(process.env.PORT || 3000);

