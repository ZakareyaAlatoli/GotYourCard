import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "./App";
import Container from "./Container";
import { screenTransitionTimeMs } from "./AppConstants";

export default function LobbyScreen() {
  const { userId, setScreen } = useContext(AppContext);
  const [position, setPosition] = useState("left");

  useEffect(() => {
    window.requestAnimationFrame(() => {
        setPosition('center');
    })
  }, []);

  function finish() {
    setPosition("right");
    setTimeout(() => {
      setScreen("QUESTION");
    }, screenTransitionTimeMs);
  }
  return (
    <Container position={position} color="#FF000044">
      <button onClick={() => finish()}>Ask a question, {userId}</button>
    </Container>
  );
}
