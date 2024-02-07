import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "./App";
import { ScreenContext } from "./Screen";
import Container from "./Container";
import useSocket from "./useSocket";

export default function ResultsScreen() {
    const {userId, socket, setLoading, room} = useContext(AppContext);
    const {visible} = useContext(ScreenContext);
    const [results, setResults] = useState({});

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
        <Container visible={visible} color="#FF440088">
            <h1>Results</h1>
            <h2>Scores</h2>
            {
                results.userData ?
                Object.keys(results.userData).map(userId => {
                    return (
                        <h3 key={userId}>{results.userData[userId].name}: {results.userData[userId].points}</h3>
                    )
                })
                : null
            }
            <h2>Questions</h2>
            {
                results.userData ? 
                Object.keys(results.userData).map((userId) => {
                    return (
                        <>
                            <p key={userId}>{results.userData[userId].name} asked "{results.userData[userId].question}"</p>
                            {
                                results.userData[userId].answers.map(answer => {
                                    return (
                                        <h3 key={answer.answererId}>{results.userData[answer.answererId].name} responded "{answer.answer}"</h3>
                                    )
                                })
                            }
                        </>

                    )
                })
                : null
            }
            <button onClick={() => socket.emit('start-game', userId)}>Play Again</button>
            <button onClick={() => {socket.emit('leave-room', userId)}}>Leave Room</button>
        </Container>
    );
}
