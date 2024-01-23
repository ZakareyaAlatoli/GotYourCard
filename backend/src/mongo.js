const {MongoClient, ObjectId} = require("mongodb");
const mongoClient = new MongoClient('mongodb://127.0.0.1/gotyourcard');

async function generateUserId(){
  await mongoClient.connect();
  const db = mongoClient.db();
  const usersCollection = db.collection('users');
  let expireDate = new Date();
  expireDate.setSeconds(expireDate.getSeconds() + 30);
  const record = await usersCollection.insertOne({expireDate: expireDate});
  
  return record.insertedId;
}

async function refreshUserId(userId){
  await mongoClient.connect();
  const db = mongoClient.db();
  const usersCollection = db.collection('users');
  let expireDate = new Date();
  expireDate.setSeconds(expireDate.getSeconds() + 30);
  const record = await usersCollection.updateOne({_id: new ObjectId(userId)},
  {$set: {expireDate: expireDate}});
  
  return record;
}

async function setUsername(userId, username){
    await mongoClient.connect();
    const db = mongoClient.db();
    const usersCollection = db.collection('users');
    await usersCollection.updateOne({ _id: new ObjectId(userId)},
    {$set: {name: username}});
    return username;
}

async function createRoom(userId){
    await mongoClient.connect();
    const db = mongoClient.db();
    const roomsCollection = db.collection('rooms');
    const {insertedId} = await roomsCollection.insertOne({memberUserIds: [new ObjectId(userId)]});
    const usersCollection = db.collection('users');
    await usersCollection.updateOne({_id: new ObjectId(userId)}, 
    { $set: {roomId: insertedId}});
    const room = await roomsCollection.findOne({_id: insertedId});
    
    return room;
}

async function getUsersById(userIds){
    await mongoClient.connect();
    const db = mongoClient.db();
    const usersCollection = db.collection('users');
    const ids = userIds.map(id => { return new ObjectId(id); });
    const cursor = usersCollection.find({_id: {$in: ids}});
    const result = await cursor.toArray();
    
    return result;
}

//This should be called at long intervals
async function deleteIdleUserIds(){
  await mongoClient.connect();
  const db = mongoClient.db();
  const usersCollection = db.collection('users');
  const date = new Date();
  const cursor = usersCollection.find({expireDate: {$lte: date}});
  const expiredUsers = await cursor.toArray();

  expiredUsers.forEach(async expiredUser => {
    const roomId = expiredUser.roomId;
    await removeUserFromRoom(expiredUser._id);
  });
  await usersCollection.deleteMany({expireDate: {$lte: date}});
  
}

async function removeUserFromRoom(userId){
    await mongoClient.connect();
    const db = mongoClient.db();
    const roomsCollection = db.collection('rooms');
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({_id: new ObjectId(userId)});
    const roomId = user.roomId;
    if(roomId == null)
        return;
    await roomsCollection.updateOne({_id: new ObjectId(roomId)}, {
        $pull: { 'memberUserIds': new ObjectId(userId)}
    });
    await usersCollection.updateOne({_id: new ObjectId(userId)}, {
        $set: {'roomId': null}
    })
    await roomsCollection.deleteMany({
        memberUserIds: {$size: 0}
    });
    
}

async function joinRoom(userId, roomId){
    await mongoClient.connect();
    const db = mongoClient.db();
    const roomsCollection = db.collection('rooms');
    const usersCollection = db.collection('users');
    await roomsCollection.updateOne({_id: new ObjectId(roomId)}, {
        $push: { 'memberUserIds': new ObjectId(userId)}
    });
    await usersCollection.updateOne({_id: new ObjectId(userId)}, {
        $set: {'roomId': roomId}
    });
    const room = await roomsCollection.findOne({_id: new ObjectId(roomId)});
    
    return room;
}

module.exports = {
    generateUserId,
    refreshUserId,
    deleteIdleUserIds,
    setUsername,
    createRoom,
    getUsersById,
    removeUserFromRoom,
    joinRoom
}

