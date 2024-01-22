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

async function setUsername(userId, name){
    await mongoClient.connect();
    const db = mongoClient.db();
    const usersCollection = db.collection('users');
    await usersCollection.updateOne({
        _id: new ObjectId(userId)
    },
    {
        $set: {
            name: name
        }
    });
    mongoClient.close();
    return name;
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

module.exports = {
    generateUserId,
    refreshUserId,
    deleteIdleUserIds,
    setUsername
}

