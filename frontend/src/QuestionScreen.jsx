import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "./App";
import { ScreenContext } from "./Screen";
import Container from "./Container";
import useSocket from "./useSocket";
import Form from "./Form";

export default function QuestionScreen() {
  const {userId, socket, setLoading} = useContext(AppContext);
  const {visible} = useContext(ScreenContext);
  const [question, setQuestion] = useState();

  useSocket(socket, ['set-question', (question) => {
    setLoading(false);
    setQuestion(question);
  }])

  function submitQuestion({question}){
    socket.emit('set-question', userId, question);
    socket.emit('refresh', userId);
    setLoading(true);
  }

  return (
    <Container visible={visible} color="#FF00FF88">
      <h1>Question Phase</h1>
      <h2>Ask a question that you can predict your opponents' answers to</h2>
      <Form onSubmit={submitQuestion}>
        <input name="question"/>
        <button type="submit">Submit</button>
      </Form>
      {question ? <h3>You asked: "{question}"</h3>: null}
    </Container>
  );
}
