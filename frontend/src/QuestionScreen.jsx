import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "./App";
import { ScreenContext } from "./Screen";
import Container from "./Container";
import useSocket from "./useSocket";
import Form from "./Form";

export default function QuestionScreen() {
  const {userId, socket, setLoading, displayMessage} = useContext(AppContext);
  const {visible} = useContext(ScreenContext);
  const [question, setQuestion] = useState();

  useSocket(socket, ['set-question', (question) => {
    setLoading(false);
    setQuestion(question);
  }])

  function submitQuestion({question}){
    if(!question || !question.trim()){
      displayMessage('Question cannot be empty!');
      return;
    }
    socket.emit('set-question', userId, question.trim());
    socket.emit('refresh', userId);
    setLoading(true);
  }

  return (
    <Container visible={visible} color="#88008855">
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
