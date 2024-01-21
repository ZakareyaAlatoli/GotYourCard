import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "./App";
import Container from "./Container";
import { screenTransitionTimeMs } from "./AppConstants";
import LoadingIcon from "./LoadingIcon";

export default function MenuScreen() {
  const { userId, setScreen, username, setUsername, socket } = useContext(AppContext);
  const [position, setPosition] = useState("left");
  const [loadingName, setLoadingName] = useState(false);

  useEffect(() => {
    socket.on('set-name', name => {
        setLoadingName(false);
    })
    window.requestAnimationFrame(() => {
        setPosition('center');
    })
    return () => {
        socket.removeAllListeners('set-name');
    }
  }, []);

  function finish() {
    setPosition("right");
    setTimeout(() => {
      setScreen("LOBBY");
    }, screenTransitionTimeMs);
  }

  function onSubmit(evt){
    evt.preventDefault();
    const formData = new FormData(evt.target);
    const values = Object.fromEntries(formData);
    setLoadingName(true);
    socket.emit('set-name', values.username);
    setUsername(values.username);
  }

  return (
    <Container position={position} color="#0000FF44">
      <button onClick={() => finish()}>Go to lobby, {userId}</button>
      {username ? <div>{username}</div> : null}
 
      <form onSubmit={onSubmit} aria-disabled={!loadingName}>      
        <input type="text" name="username"/>
        
        <button type="submit">Set Name</button>
        {loadingName ? <LoadingIcon /> : null}
      </form>
    </Container>
  );
}
