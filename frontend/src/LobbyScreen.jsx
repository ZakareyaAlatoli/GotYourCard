import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "./App";
import { ScreenContext } from "./Screen";
import Container from "./Container";
import useSocket from "./useSocket";
import { Screens } from "./AppConstants";

export default function LobbyScreen() {
  const {userId, room, socket} = useContext(AppContext);
  const {goToScreen, visible} = useContext(ScreenContext);
  const [roomMembers, setRoomMembers] = useState([]);

  useSocket(socket, 
    ['get-users', users => {
      setRoomMembers(users);
    }],
    ['question-phase', () => {
      goToScreen(Screens.QUESTION);
    }]
  );

  useEffect(() => {
    socket.emit('get-users', room?.memberUserIds);
  }, []);

  useEffect(() => {
    socket.emit('get-users', room?.memberUserIds);
  },[room])

  function startGame(){
    socket.emit('start-game', userId);
  }

  function leaveRoom(){
    socket.emit('leave-room', userId);
    goToScreen(Screens.MENU);
  }
  return (
    <Container visible={visible} color="#88000055">
      <h1>Lobby</h1>
      <h2>Room Code: <span style={{WebkitTextStrokeColor: 'lightgreen'}}>{room? room._id : null}</span></h2>
      <h2>Current Members</h2>
      <ul>
        {
          roomMembers.map(roomMember => {
            return <li key={roomMember._id}>{roomMember.name}</li>
          })
        }
      </ul>
      <button onClick={startGame}>Start Game</button>
      <button onClick={leaveRoom}>Leave Room</button>
    </Container>
  );
}
