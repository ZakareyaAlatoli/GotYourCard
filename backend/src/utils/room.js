export const RoomState = Object.freeze({
  LOBBY: 0,
  QUESTIONING: 1,
  ANSWERING: 2,
  MATCHING: 3,
  RESULTS: 4
});

export class Room {
  constructor(roomCode){
    this.roomCode = roomCode;
    this.phase = RoomState.LOBBY;
    //map player ID to questions
    this.players = [];
    this.questions = {};
    this.answers = {};
    this.matches = {};
  }
}