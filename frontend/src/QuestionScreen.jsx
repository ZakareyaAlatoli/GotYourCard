import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "./App";
import { ScreenContext } from "./Screen";
import Container from "./Container";
import useSocket from "./useSocket";

export default function QuestionScreen() {
  const {username} = useContext(AppContext);
  const {visible} = useContext(ScreenContext);

  return (
    <Container visible={visible} color="#FF00FF44">
      <h1>Question Phase</h1>
      <h2>{username}</h2>
    </Container>
  );
}
