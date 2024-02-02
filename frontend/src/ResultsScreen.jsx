import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "./App";
import { ScreenContext } from "./Screen";
import Container from "./Container";
import useSocket from "./useSocket";
import Form from "./Form";

export default function ResultsScreen() {
    const {userId, username, socket, setLoading, room} = useContext(AppContext);
    const {visible} = useContext(ScreenContext);
    const [answers, setAnswers] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [roomMembers, setRoomMembers] = useState([]);
    const [matches, setMatches] = useState([]);

    return (
        <Container visible={visible} color="#FF440044">
            <h1>Results</h1>
        </Container>
    );
}
