import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "./App";
import { ScreenContext } from "./Screen";
import Container from "./Container";
import useSocket from "./useSocket";
import Form from "./Form";

export default function QuestionScreen() {
  const {userId, username, socket, setLoading} = useContext(AppContext);
  const {visible} = useContext(ScreenContext);
  const [question, setQuestion] = useState();

  useSocket(socket, ['set-question', (question) => {
    setLoading(false);
    setQuestion(question);
  }])

  function submitQuestion({question}){
    socket.emit('set-question', userId, question);
    setLoading(true);
    console.log(question);
  }

  return (
    <Container visible={visible} color="#FF00FF44">
      <h1>Question Phase</h1>
      <h2>{username}</h2>

      <Form onSubmit={submitQuestion}>
        <h3>Ask a question that you can predict your opponents' answers to</h3>
        <input name="question"/>
        <button type="submit">Submit</button>
      </Form>
      {question ? <h3>You asked: "{question}"</h3>: null}
    </Container>
  );
}
