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
  }]);

    useEffect(() => {
        setLoading(true);
        socket.emit('get-questions', userId);
    },[])

    function submit(values){
        let answers = [];
        let completed = true;
        Object.entries(values).forEach(([key, value])=>{
            if(!value){
                alert('You must answer all questions!');
                completed = false;
                return;
            }
            answers.push({
                questionId: key,
                answer: value
            });
        })
        if(completed)
            socket.emit('set-answers', userId, answers);
    }

  return (
    <Container visible={visible} color="#FFFF0044">
      <h1>Answer Phase</h1>
        <Form onSubmit={submit}>
            {
                questions?.map(question => {
                    if(userId != question.userId){
                        return(
                            <>
                                <label key={question._id}>{question.question}
                                    <input key={question._id} type='text' name={question._id} />
                                </label>
                                
                            </>
                        )
                    }
                })
            }
            <button type="submit">Submit</button>
        </Form>
    </Container>
  );
}
