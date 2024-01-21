const { createServer } = require('http');
const { Server } = require('socket.io');
const {MongoClient, ObjectId} = require("mongodb");
const mongoClient = new MongoClient('mongodb://127.0.0.1/gotyourcard');

async function generateUserId(){
  await mongoClient.connect();
  const db = mongoClient.db();
  const usersCollection = db.collection('users');
  let expireDate = new Date();
  expireDate.setSeconds(expireDate.getSeconds() + 30);
  const record = await usersCollection.insertOne({
    expireDate: expireDate
  });
  mongoClient.close();
  return record.insertedId;
}

async function refreshUserId(userId){
  await mongoClient.connect();
  const db = mongoClient.db();
  const usersCollection = db.collection('users');
  let expireDate = new Date();
  expireDate.setSeconds(expireDate.getSeconds() + 30);
  const record = await usersCollection.updateOne({
    _id: new ObjectId(userId)
  },
  {
    $set: {
      expireDate: expireDate
    }
  });
  mongoClient.close();
  return record;
}

//This should be called at long intervals
async function deleteIdleUserIds(){
  await mongoClient.connect();
  const db = mongoClient.db();
  const usersCollection = db.collection('users');
  await usersCollection.deleteMany({
    expireDate: {
      $lte: new Date()
    }
  });
  mongoClient.close();
}

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
  socket.on('set-name', name => {
    socket.emit('set-name');
  })
})

//TODO: maybe separate this from the game server?
setInterval(() => {
  deleteIdleUserIds();
}, 3_600_000);

server.listen(process.env.PORT || 3000);

