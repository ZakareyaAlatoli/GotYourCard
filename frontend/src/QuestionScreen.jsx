import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "./App";
import Container from "./Container";
import { screenTransitionTimeMs } from "./AppConstants";

export default function QuestionScreen() {
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
      setScreen();
    }, screenTransitionTimeMs);
  }
  return (
    <Container position={position} color="#00FF0044">
      <button onClick={() => finish()}>Return to lobby, {userId}</button>
    </Container>
  );
}
