import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "./App";
import Container from "./Container";
import { screenTransitionTimeMs } from "./AppConstants";
import useSocket from "./useSocket";

export default function MenuScreen() {
  const { 
    userId, 
    setScreen, 
    username, 
    setUsername, 
    socket, 
    setRoom,
    loading,
    setLoading
  } = useContext(AppContext);
  const [position, setPosition] = useState("left");
  const [joinFormOpen, setJoinFormOpen] = useState(false);

  useSocket(socket, 
    ['set-name', name => {
        setUsername(name);
        setLoading(false);
    }],
    ['create-room', room => {
        setRoom(room);
        goToScreen('LOBBY');
    }],
    ['join-room', room => {
        if(room){
            setRoom(room);
            goToScreen('LOBBY');
        }
        else{
            console.error('Could not join room');
        }
        setLoading(false);
    }]
);

  useEffect(() => {
    window.requestAnimationFrame(() => {
        setPosition('center');
    })
  }, []);

  function goToScreen(screen) {
    setPosition("right");
    setTimeout(() => {
      setScreen(screen);
    }, screenTransitionTimeMs);
  }

  function submitName(evt){
    evt.preventDefault();
    const formData = new FormData(evt.target);
    const values = Object.fromEntries(formData);
    setLoading(true);
    socket.emit('set-name', userId, values.username);
  }

  function submitRoomId(evt){
    evt.preventDefault();
    const formData = new FormData(evt.target);
    const values = Object.fromEntries(formData);
    setLoading(true);
    joinRoom(values.roomId);
  }

  function createRoom(){
    socket.emit('create-room', userId);
  }

  function joinRoom(roomId){
    socket.emit('join-room', userId, roomId);
  }

  return (
    <Container position={position} color="#0000FF44">
        {username ? <div>{username}</div> : null}
    
        <form onSubmit={submitName} aria-disabled={!loading}>      
            <input type="text" name="username"/>
            <button type="submit">Set Name</button>
        </form>
        <button onClick={createRoom}>Create Game</button>
        {joinFormOpen ?
            <form onSubmit={submitRoomId} aria-disabled={!loading}>
                <input type="text" name="roomId"/>
                <button type="submit">Enter Room Code</button>
            </form>
            : <button onClick={() => setJoinFormOpen(true)}>Join Game</button> 
        }
    </Container>
  );
}
