import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "./App";
import { ScreenContext } from "./Screen";
import Container from "./Container";
import useSocket from "./useSocket";
import Form from "./Form";

export default function MatchScreen() {
    const {userId, username, socket, setLoading, room} = useContext(AppContext);
    const {visible} = useContext(ScreenContext);
    const [answers, setAnswers] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [roomMembers, setRoomMembers] = useState([]);
    const [matches, setMatches] = useState([]);

    function validateGameData(){
        if(answers.length == 0 || questions.length == 0 || roomMembers == [])
            return;
        setLoading(false);
        let newMatches = [];
        //Get user's question id from all questions in this room
        let myQuestionId;
        if(questions != []){
            myQuestionId = questions?.filter(question => {
                return question.userId == userId;
            })[0]._id;
        }
        answers.forEach(answer => {
            if(answer.userId != userId){//if not user's answer...
                answer.answers.forEach(givenAnswer => {
                    if(givenAnswer.questionId == myQuestionId){
                        newMatches.push({
                            answerId: answer._id,
                            askerId: answer.userId,
                            answer: givenAnswer.answer
                        })
                    }
                })
            }
        })
        setMatches(newMatches);
    }

    useEffect(() => {
        setLoading(true);
        socket.emit('get-answers', userId);
        socket.emit('get-questions', userId);
        socket.emit('get-users', room?.memberUserIds);
    },[])

    useEffect(() => {
        validateGameData();
    },[answers, questions, roomMembers])

    useSocket(socket, 
        ['get-answers', newAnswers => {
            setAnswers(newAnswers);
        }],
        ['get-questions', newQuestions => {
            setQuestions(newQuestions);
        }],
        ['get-users', newRoomMembers => {
            setRoomMembers(newRoomMembers);
        }],
    );

    function submit(values){
        socket.emit('refresh', userId);
        let matches = [];
        Object.entries(values).forEach(([key, value])=>{
            matches.push({
                answerId: key,
                askerId: value
            });
        })
        socket.emit('set-matches', userId, matches);
    }

    return (
        <Container visible={visible} color="#00888855">
            <h1>Match Phase</h1>
            <h2>
                You asked: "{questions?.filter(question => {
                    return question.userId == userId;
                })[0]?.question}"
            </h2>
            <h2>Who do you think gave the following answers?</h2>
            <Form onSubmit={submit}>
                {
                    matches.map(match => {
                        return(
                            <label key={match.answerId}>
                                {match.answer}
                                <select key={match.answerId} name={match.answerId}>
                                    {
                                        roomMembers?.filter(roomMember => {
                                            return roomMember._id != userId;
                                        }).map(remainingMember => {
                                            return (
                                                <option 
                                                    key={remainingMember._id}
                                                    value={remainingMember._id}
                                                >
                                                    {remainingMember.name}
                                                </option>
                                            )
                                        })
                                    }
                                </select>
                                <br />
                            </label>
                        )
                    })
                }
                <br />
                <button type="submit">Submit</button>
            </Form>
        </Container>
    );
}
