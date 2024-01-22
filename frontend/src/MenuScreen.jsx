import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "./App";
import Container from "./Container";
import { screenTransitionTimeMs } from "./AppConstants";
import LoadingIcon from "./LoadingIcon";

export default function MenuScreen() {
  const { userId, setScreen, username, setUsername, socket, setRoom } = useContext(AppContext);
  const [position, setPosition] = useState("left");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    socket.on('set-name', name => {
        setUsername(name);
        setLoading(false);
    })
    socket.on('create-room', room => {
        setRoom(room);
        goToScreen('LOBBY');
    })


    window.requestAnimationFrame(() => {
        setPosition('center');
    })
    return () => {
        socket.removeAllListeners('set-name');
        socket.removeAllListeners('create-room');
    }
  }, []);

  function goToScreen(screen) {
    setPosition("right");
    setTimeout(() => {
      setScreen(screen);
    }, screenTransitionTimeMs);
  }

  function submit(evt){
    evt.preventDefault();
    const formData = new FormData(evt.target);
    const values = Object.fromEntries(formData);
    setLoading(true);
    socket.emit('set-name', userId, values.username);
  }

  function createRoom(){
    socket.emit('create-room', userId);
  }

  return (
    <Container position={position} color="#0000FF44">
      {username ? <div>{username}</div> : null}
 
      <form onSubmit={submit} aria-disabled={!loading}>      
        <input type="text" name="username"/>
        
        <button type="submit">Set Name</button>
        {loading ? <LoadingIcon /> : null}
      </form>
      <button onClick={createRoom}>Create Game</button>
      <button>Join Game</button>
    </Container>
  );
}
