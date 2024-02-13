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
    setLoading,
    displayMessage
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
    if(!username){
      displayMessage('Name cannot be blank');
      return;
    }
    setLoading(true);
    socket.emit('refresh', userId);
    socket.emit('set-name', userId, username);
    displayMessage(`Changing name to "${username}"`);
  }

  function submitRoomId({roomId}){
    if(!username){
      displayMessage('Name cannot be blank');
      return;
    }
    setLoading(true);
    joinRoom(roomId);
  }

  function createRoom(){
    if(!username){
      displayMessage('Name cannot be blank');
      return;
    }
    socket.emit('create-room', userId);
  }

  function joinRoom(roomId){
    socket.emit('join-room', userId, roomId);
  }

  return (
    <Container visible={visible} color="#00008855">    
        <Form onSubmit={submitName} aria-disabled={!loading}>      
            <input 
              type="text" 
              name="username" 
              placeholder={username ? username : "Enter your name"}
              title="Change name"
              style={{
                backgroundColor: 'lightblue'
              }}
            />
        </Form>
        {username ? 
          <>
            <button onClick={createRoom}>Create Game</button>
            {joinFormOpen ?
              <Form onSubmit={submitRoomId} aria-disabled={!loading}>
                  <input 
                    type="text" 
                    name="roomId" 
                    placeholder="Enter room code to join" 
                  />
              </Form>
              : <button onClick={() => setJoinFormOpen(true)}>Join Game</button> 
            }
          </>
        : null}
        <h1>How To Play</h1>
        <p>
            Each player asks a question, then everyone answers each other's questions. The goal of the game 
            is to accurately match which player gave which answer to YOUR question. You get 1 point for each 
            correct guess. The trick is to ask a question that you think each player will answer differently.
        </p>
    </Container>
  );
}
