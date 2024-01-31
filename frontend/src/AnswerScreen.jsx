import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "./App";
import { ScreenContext } from "./Screen";
import Container from "./Container";
import useSocket from "./useSocket";
import Form from "./Form";

export default function AnswerScreen() {
  const {userId, username, socket, setLoading} = useContext(AppContext);
  const {visible} = useContext(ScreenContext);
  const [questions, setQuestions] = useState([]);

  useSocket(socket, ['get-questions', newQuestions => {
    setQuestions(newQuestions);
    setLoading(false);
  }]);

    useEffect(() => {
        setLoading(true);
        socket.emit('get-questions', userId);
    },[])

  return (
    <Container visible={visible} color="#FFFF0044">
      <h1>Answer Phase</h1>
        <Form>
            {
                questions?.map(question => {
                    if(userId != question.userId){
                        return(
                            <>
                                <label key={question.userId}>{question.question}
                                    <input key={question.userId} type='text' name={question.userId} />
                                </label>
                                
                            </>
                        )
                    }
                })
            }
        </Form>
    </Container>
  );
}
