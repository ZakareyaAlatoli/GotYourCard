import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "./App";
import Container from "./Container";
import { screenTransitionTimeMs } from "./AppConstants";

export default function MenuScreen() {
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
      setScreen("LOBBY");
    }, screenTransitionTimeMs);
  }
  return (
    <Container position={position} color="#0000FF44">
      <button onClick={() => finish()}>Go to lobby, {userId}</button>
    </Container>
  );
}
