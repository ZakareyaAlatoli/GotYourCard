import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "./App";
import Container from "./Container";
import { screenTransitionTimeMs } from "./AppConstants";
import useSocket from "./useSocket";

export default function QuestionScreen() {
  const { userId, setScreen, room, socket } = useContext(AppContext);
  const [position, setPosition] = useState("left");

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

  return (
    <Container position={position} color="#FF00FF44">
      <h1>Question Phase</h1>
    </Container>
  );
}
