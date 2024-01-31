import React, { useState, useContext } from "react";
import { AppContext } from "./App";
import { ScreenContext } from "./Screen";
import Container from "./Container";
import useSocket from "./useSocket";
import Form from "./Form";

export default function AnswerScreen() {
  const {userId, username, socket, setLoading} = useContext(AppContext);
  const {visible} = useContext(ScreenContext);

  return (
    <Container visible={visible} color="#FFFF0044">
      <h1>Answer Phase</h1>
      <h2>{username}</h2>
    </Container>
  );
}
