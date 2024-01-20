import { useEffect, useState, createContext, useContext } from "react"
import {io} from 'socket.io-client'
import './App.css'
import MenuScreen from "./MenuScreen";
import LobbyScreen from "./LobbyScreen";
import QuestionScreen from "./QuestionScreen";

export const AppContext = createContext();


export default function App() {
  //TODO: change to use env var
  const [socket, setSocket] = useState(io('ws://localhost:3000'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [screen, setScreen] = useState();

  useEffect(() => {
    if(!userId){
      socket.emit('request-id');
    }
    else{
      socket.emit('refresh-id', userId);
    }
    socket.on('reconnect', (attempt) => {
      socket.emit('refresh-id', userId);
    })
    socket.on('receive-id', id => {
      localStorage.setItem('userId', id);
      setUserId(id);
    })
  },[]);

  return (
    <AppContext.Provider value={
      {
        userId: userId,
        setScreen
      }
    }>
      <img
        width="100%"
        style={{ position: "absolute" }}
        src="../public/placeholder_logo.jpg"
      />
      {
        screen === "LOBBY" ? <LobbyScreen /> : 
        screen === "QUESTION" ? <QuestionScreen /> :
        <MenuScreen />
      }
    </AppContext.Provider>
  )
}
