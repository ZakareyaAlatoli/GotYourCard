const {MongoClient, ObjectId} = require("mongodb");
const mongoClient = new MongoClient('mongodb://127.0.0.1/gotyourcard');

async function generateUserId(){
  await mongoClient.connect();
  const db = mongoClient.db();
  const usersCollection = db.collection('users');
  let expireDate = new Date();
  expireDate.setSeconds(expireDate.getSeconds() + 30);
  const record = await usersCollection.insertOne({expireDate: expireDate});
  await mongoClient.close();
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
  await mongoClient.close();
  return record;
}

async function setUsername(userId, name){
    await mongoClient.connect();
    const db = mongoClient.db();
    const usersCollection = db.collection('users');
    await usersCollection.updateOne({ _id: new ObjectId(userId)},
    {$set: {name: name}});
    await mongoClient.close();
    return name;
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
    await mongoClient.close();
    return room;
}

async function getUsersById(userIds){
    await mongoClient.connect();
    const db = mongoClient.db();
    const usersCollection = db.collection('users');
    const ids = userIds.map(id => { return new ObjectId(id); });
    const cursor = usersCollection.find({_id: {$in: ids}});
    const result = await cursor.toArray();
    await mongoClient.close();
    return result;
}

//This should be called at long intervals
async function deleteIdleUserIds(){
  await mongoClient.connect();
  const db = mongoClient.db();
  const usersCollection = db.collection('users');
  await usersCollection.deleteMany({expireDate: {$lte: new Date()}});
  await mongoClient.close();
}

async function removeUserFromRoom(userId){
    await mongoClient.connect();
    const db = mongoClient.db();
    const roomsCollection = db.collection('rooms');
    const usersCollection = db.collection('users');

    const {roomId} = await usersCollection.findOne({_id: new ObjectId(userId)});
    await roomsCollection.updateOne({_id: new ObjectId(roomId)}, {
        $pull: { 'memberUserIds': new ObjectId(userId)}
    });
    await usersCollection.updateOne({_id: new ObjectId(userId)}, {
        $set: {'roomId': null}
    })
    await roomsCollection.deleteMany({
        memberUserIds: {$size: 0}
    });
    await mongoClient.close();
}

module.exports = {
    generateUserId,
    refreshUserId,
    deleteIdleUserIds,
    setUsername,
    createRoom,
    getUsersById,
    removeUserFromRoom
}

