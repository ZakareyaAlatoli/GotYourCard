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
    goToScreen();
  }
  return (
    <Container visible={visible} color="#FF000044">
      <h1>Lobby</h1>
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
