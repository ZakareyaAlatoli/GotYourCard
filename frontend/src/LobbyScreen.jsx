import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "./App";
import Container from "./Container";
import { screenTransitionTimeMs } from "./AppConstants";

export default function LobbyScreen() {
  const { userId, setScreen, room, socket } = useContext(AppContext);
  const [position, setPosition] = useState("left");
  const [roomMembers, setRoomMembers] = useState([]);

  useEffect(() => {
    socket.emit('get-users', room?.memberUserIds);
    socket.on('get-users', users => {
      setRoomMembers(users);
    })
    window.requestAnimationFrame(() => {
      setPosition('center');
    })
    return () => {
      socket.removeAllListeners('get-users');
    }
  }, []);

  useEffect(() => {
    socket.emit('get-users', room?.memberUserIds);
  },[room])

  function goToScreen(screen) {
    setPosition("right");
    setTimeout(() => {
      setScreen(screen);
    }, screenTransitionTimeMs);
  }

  function leaveRoom(){
    socket.emit('leave-room', userId);
    goToScreen(screen)
  }
  return (
    <Container position={position} color="#FF000044">
      <h1>Lobby</h1>
      <ul>
        {
          roomMembers.map(roomMember => {
            return <li key={roomMember._id}>{roomMember.name}</li>
          })
        }
      </ul>
      <button onClick={leaveRoom}>Leave Room</button>
    </Container>
  );
}
