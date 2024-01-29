import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "./App";
import { ScreenContext } from "./Screen";
import { Screens } from "./AppConstants";
import Container from "./Container";
import useSocket from "./useSocket";
import Form from "./Form";

export default function MenuScreen() {
  const { 
    userId, 
    username, 
    setUsername, 
    socket, 
    setRoom,
    loading,
    setLoading
  } = useContext(AppContext);

  const {goToScreen, visible} = useContext(ScreenContext);
  const [joinFormOpen, setJoinFormOpen] = useState(false);

  useSocket(socket, 
    ['set-name', name => {
        setUsername(name);
        setLoading(false);
    }],
    ['create-room', room => {
        setRoom(room);
        goToScreen(Screens.LOBBY);
    }],
    ['join-room', room => {
        if(room){
            setRoom(room);
            goToScreen(Screens.LOBBY);
        }
        else{
            console.error('Could not join room');
        }
        setLoading(false);
    }]
);

  function submitName({username}){
    setLoading(true);
    socket.emit('set-name', userId, username);
  }

  function submitRoomId({roomId}){
    setLoading(true);
    joinRoom(roomId);
  }

  function createRoom(){
    socket.emit('create-room', userId);
  }

  function joinRoom(roomId){
    socket.emit('join-room', userId, roomId);
  }

  return (
    <Container visible={visible} color="#0000FF44">
        {username ? <div>{username}</div> : null}
    
        <Form onSubmit={submitName} aria-disabled={!loading}>      
            <input type="text" name="username"/>
            <button type="submit">Set Name</button>
        </Form>
        <button onClick={createRoom}>Create Game</button>
        {joinFormOpen ?
            <Form onSubmit={submitRoomId} aria-disabled={!loading}>
                <input type="text" name="roomId"/>
                <button type="submit">Enter Room Code</button>
            </Form>
            : <button onClick={() => setJoinFormOpen(true)}>Join Game</button> 
        }
    </Container>
  );
}
