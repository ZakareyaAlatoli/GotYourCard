import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "./App";
import { ScreenContext } from "./Screen";
import Container from "./Container";
import useSocket from "./useSocket";

export default function ResultsScreen() {
    const {userId, socket, setLoading} = useContext(AppContext);
    const {visible} = useContext(ScreenContext);
    const [results, setResults] = useState({});
    const [showQuestions, setShowQuestions] = useState(false);

    useEffect(() => {
        setLoading(true);
        socket.emit('get-results', userId);
    },[])

    useSocket(socket, 
        ['get-results', newResults => {
            console.log(newResults);
            setLoading(false);
            setResults(newResults);
        }]
    )

    return (
        <Container visible={visible} color="#88220088">
            <h1>Results</h1>
            <h2>Points</h2>
            {
                results.userData ?
                Object.keys(results.userData).map(id => {
                    return (
                        <h3 key={id} style={{color: userId == id ? 'gold' : 'white'}}>
                            {results.userData[id].name}: {results.userData[id].points}
                        </h3>
                    )
                })
                : null
            }
            {
                !showQuestions ?
                <>
                    <button onClick={() => setShowQuestions(true)}>Show Questions and Answers</button>
                    <br />
                </>
                : null
            }
            {
                showQuestions ?
                    results.userData ? 
                    Object.keys(results.userData).map((id) => {
                        return (
                            <>
                                <p key={id} style={{color: id == userId ? 'gold' : 'white'}}>{results.userData[id].name} asked "{results.userData[id].question}"</p>
                                {
                                    results.userData[id].answers.map(answer => {
                                        return (
                                            <h3 key={answer.answererId}>{results.userData[answer.answererId].name} responded "{answer.answer}"</h3>
                                        )
                                    })
                                }
                            </>

                        )
                    })
                    : null
                : null
            }
            <button onClick={() => socket.emit('start-game', userId)}>Play Again</button>
            <button onClick={() => {socket.emit('leave-room', userId)}}>Leave Room</button>
        </Container>
    );
}
