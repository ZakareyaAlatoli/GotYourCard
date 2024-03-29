import React, {createContext, useContext, useEffect, useState} from "react";
import MenuScreen from "./MenuScreen";
import LobbyScreen from "./LobbyScreen";
import QuestionScreen from "./QuestionScreen";
import AnswerScreen from "./AnswerScreen.jsx";
import MatchScreen from "./MatchScreen.jsx";
import ResultsScreen from "./ResultsScreen.jsx";
import { Screens } from "./AppConstants";
import { AppContext } from "./App";
import useSocket from "./useSocket";

export const ScreenContext = createContext();

export default function Screen(){
    const [screen, setScreen] = useState();
    const [visible, setVisible] = useState(true);
    const transitionTime = 500;
    const {socket} = useContext(AppContext);

    useSocket(socket, 
        ['set-screen', screen => {
            goToScreen(screen);
        }],
        ['set-screen-immediate', screen => {
            setScreen(screen);
        }],
    );

    function goToScreen(screen) {
        setVisible(false);
        setTimeout(() => {
            setScreen(screen);
            window.requestAnimationFrame(() => {
                setVisible(true)
            })
        }, transitionTime);
    }

    return (
        <ScreenContext.Provider value={{
            goToScreen,
            visible,
            transitionTime
        }}>
            {
                screen === Screens.MENU ? <MenuScreen /> :
                screen === Screens.LOBBY ? <LobbyScreen /> : 
                screen === Screens.QUESTION ? <QuestionScreen /> :
                screen === Screens.ANSWER ? <AnswerScreen /> :
                screen === Screens.MATCH ? <MatchScreen /> :
                screen === Screens.RESULTS ? <ResultsScreen /> :
                null
            }       
        </ScreenContext.Provider>
    )
}