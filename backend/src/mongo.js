const {MongoClient, ObjectId} = require("mongodb");
const mongoClient = new MongoClient('mongodb://127.0.0.1/gotyourcard');
const {Screens} = require('./AppConstants');

const userTimeoutMs = 360_000;

module.exports.generateUserId = async function(){
  await mongoClient.connect();
  const db = mongoClient.db();
  const usersCollection = db.collection('users');
  let expireDate = new Date();
  expireDate.setSeconds(expireDate.getMilliseconds + userTimeoutMs);
  const record = await usersCollection.insertOne({expireDate: expireDate});
  
  return record.insertedId;
}

module.exports.refreshUserId = async function(userId){
  await mongoClient.connect();
  const db = mongoClient.db();
  const usersCollection = db.collection('users');
  let expireDate = new Date();
  expireDate.setSeconds(expireDate.getMilliseconds() + userTimeoutMs);
  const record = await usersCollection.updateOne({_id: new ObjectId(userId)},
  {$set: {expireDate: expireDate}});
  
  return record;
}

module.exports.setUsername = async function(userId, username){
    await mongoClient.connect();
    const db = mongoClient.db();
    const usersCollection = db.collection('users');
    await usersCollection.updateOne({ _id: new ObjectId(userId)},
    {$set: {name: username}});
    return username;
}

module.exports.createRoom = async function(userId){
    await mongoClient.connect();
    const db = mongoClient.db();
    const roomsCollection = db.collection('rooms');
    const {insertedId} = await roomsCollection.insertOne({phase: Screens.LOBBY, memberUserIds: [new ObjectId(userId)]});
    const usersCollection = db.collection('users');
    await usersCollection.updateOne({_id: new ObjectId(userId)}, 
    { $set: {roomId: insertedId}});
    const room = await roomsCollection.findOne({_id: insertedId});
    return room;
}

module.exports.getUsersById = async function(userIds){
    await mongoClient.connect();
    const db = mongoClient.db();
    const usersCollection = db.collection('users');
    const ids = userIds.map(id => { return new ObjectId(id); });
    const cursor = usersCollection.find({_id: {$in: ids}});
    const result = await cursor.toArray();
    
    return result;
}

module.exports.getRoomById = async function (roomId){
    await mongoClient.connect();
    const db = mongoClient.db();
    const roomsCollection = db.collection('rooms');
    const result = await roomsCollection.findOne({_id: new ObjectId(roomId)});
    
    return result;
}

module.exports.getRoomByUserId = async function(userId){
    await mongoClient.connect();
    const db = mongoClient.db();
    const roomsCollection = db.collection('rooms');
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({_id: new ObjectId(userId)});
    const room = await roomsCollection.findOne({_id: user.roomId});

    return room;
}

//This should be called at long intervals

module.exports.removeUserFromRoom = async function(userId){
    await mongoClient.connect();
    const db = mongoClient.db();
    const roomsCollection = db.collection('rooms');
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne({_id: new ObjectId(userId)});
    const roomId = user?.roomId;
    if(roomId == null)
        return;
    
    await roomsCollection.updateOne({_id: new ObjectId(roomId)}, {
        $pull: { memberUserIds: new ObjectId(userId)}
    });
    await usersCollection.updateOne({_id: new ObjectId(userId)}, {
        $set: {roomId: null}
    });
    await roomsCollection.deleteMany({
        memberUserIds: {$size: 0}
    });
}

module.exports.deleteUserGameData = async function(userIds){
    await mongoClient.connect();
    const db = mongoClient.db();
    
    await db.collection('questions').deleteMany({userId: {$in: userIds}});
    await db.collection('answers').deleteMany({userId: {$in: userIds}});
    await db.collection('matches').deleteMany({userId: {$in: userIds}});
}

module.exports.deleteIdleUserIds = async function(){
  await mongoClient.connect();
  const db = mongoClient.db();
  const usersCollection = db.collection('users');
  const date = new Date();
  const cursor = usersCollection.find({expireDate: {$lte: date}});
  const expiredUsers = await cursor.toArray();

  expiredUsers.forEach(async expiredUser => {
    await this.removeUserFromRoom(expiredUser._id);
  });
  await this.deleteUserGameData(expiredUsers);
  await usersCollection.deleteMany({expireDate: {$lte: date}});
  
}

module.exports.joinRoom = async function(userId, roomId){
    await mongoClient.connect();
    const db = mongoClient.db();
    const roomsCollection = db.collection('rooms');
    const usersCollection = db.collection('users');
    const record = await roomsCollection.updateOne({_id: new ObjectId(roomId)}, {
        $push: { memberUserIds: new ObjectId(userId)}
    });
    if(record.modifiedCount == 0)
        throw ('Room doesn\'t exist');
    await usersCollection.updateOne({_id: new ObjectId(userId)}, {
        $set: {'roomId': new ObjectId(roomId)}
    });
    const room = await roomsCollection.findOne({_id: new ObjectId(roomId)});
    
    return room;
}

module.exports.setRoomPhase = async function(roomId, phase){
    await mongoClient.connect();
    const db = mongoClient.db();
    const roomsCollection = db.collection('rooms');

    await roomsCollection.updateOne({_id: new ObjectId(roomId)}, {
        $set: {'phase': phase}
    });
}

module.exports.startGame = async function(roomId){
    await this.resetRoom(roomId);
    await this.setRoomPhase(roomId, Screens.QUESTION);
}

module.exports.getQuestionsByRoomId = async function(roomId){
    await mongoClient.connect();
    const db = mongoClient.db();
    const questionsCollection = db.collection('questions');

    const {memberUserIds} = await this.getRoomById(roomId);
    const cursor = questionsCollection.find({userId: {$in: memberUserIds}});
    const questions = await cursor.toArray();

    return questions;
}

module.exports.setQuestion = async function(userId, question){
    await mongoClient.connect();
    const db = mongoClient.db();
    const questionsCollection = db.collection('questions');

    await questionsCollection.updateOne({userId: new ObjectId(userId)}, 
        {$set: {
            userId: new ObjectId(userId),
            question: question
        }},
        {upsert: true}
    );

    return question;
}

module.exports.getAnswersByRoomId = async function(roomId){
    await mongoClient.connect();
    const db = mongoClient.db();
    const answersCollection = db.collection('answers');

    const {memberUserIds} = await this.getRoomById(roomId);
    const cursor = answersCollection.find({userId: {$in: memberUserIds}});
    const answers = await cursor.toArray();

    return answers;
}

module.exports.setAnswers = async function(userId, answers){
    await mongoClient.connect();
    const db = mongoClient.db();
    const answersCollection = db.collection('answers');

    await answersCollection.updateOne({userId: new ObjectId(userId)}, 
        {$set: {
            userId: new ObjectId(userId),
            answers: answers
        }},
        {upsert: true}
    );   
}

module.exports.getMatchesByRoomId = async function(roomId){
    await mongoClient.connect();
    const db = mongoClient.db();
    const matchesCollection = db.collection('matches');

    const {memberUserIds} = await this.getRoomById(roomId);
    const cursor = matchesCollection.find({userId: {$in: memberUserIds}});
    const matches = await cursor.toArray();

    return matches;
}

module.exports.setMatches = async function(userId, matches){
    await mongoClient.connect();
    const db = mongoClient.db();
    const matchesCollection = db.collection('matches');

    await matchesCollection.updateOne({userId: new ObjectId(userId)}, 
        {$set: {
            userId: new ObjectId(userId),
            matches: matches
        }},
        {upsert: true}
    );   
}

module.exports.getResultsByRoomId = async function(roomId){
    await mongoClient.connect();
    const db = mongoClient.db();
    const resultsCollection = db.collection('results');

    let results = await resultsCollection.findOne({roomId: new ObjectId(roomId)});
    return results;
}

module.exports.resetRoom = async function(roomId){
    await mongoClient.connect();
    const db = mongoClient.db();
    //question, answers, matches
    const room = await this.getRoomById(roomId);
    
    await this.deleteUserGameData(room.memberUserIds);
}

module.exports.setResults = async function(roomId){
    await mongoClient.connect();
    const db = mongoClient.db();
    const room = await this.getRoomById(roomId);
    const users = await this.getUsersById(room.memberUserIds.map(id => id.toString()));

    let results = {};
    users.forEach(user => {
        results[user._id] = {
            points: 0,
            name: user.name
        }
    })

    const questions = await this.getQuestionsByRoomId(roomId);
    const answers = await this.getAnswersByRoomId(roomId);
    questions.forEach(question => { 
        results[question.userId].question = question.question;
        results[question.userId].answers = [];
        const questionId = question._id;
        answers.forEach(answer => {
            const answererId = answer.userId;
            answer.answers.forEach(specificAnswer => {
                if(specificAnswer.questionId == questionId){
                    results[question.userId].answers.push({
                        _id: answer._id,
                        answererId: answererId,
                        answer: specificAnswer.answer
                    })
                }
            })
        })
    })
    const matches = await this.getMatchesByRoomId(roomId);
    matches.forEach(match => {
        //TODO: find out who gave match.answerId
        //match.userId is the person who guessed gave the corresponding answerId
        //Check if match.askerId == the person who has the answerId. If so, that's a correct match
        const currentUserId = match.userId;
        match.matches.forEach(specificMatch => {
            const assumedId = specificMatch.askerId;
            //Get actual userId of person who gave specifiMatch.answerId
            const actualId = answers.filter(answer => {
                return answer._id == specificMatch.answerId;
            })[0].userId;
            if(assumedId == actualId){
                results[currentUserId].points += 1;
            }
        })
    })
    const resultsCollection = db.collection('results');
    await resultsCollection.updateOne({roomId: new ObjectId(roomId)},
        {$set: {
            roomId: new ObjectId(roomId),
            userData: results
        }},
        {upsert: true}
    );
}

