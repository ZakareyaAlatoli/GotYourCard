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
  const [username, setUsername] = useState();
  const [room, setRoom] = useState({});
  const [screen, setScreen] = useState();

  useEffect(() => {
    if(!userId){
      socket.emit('set-id');
    }
    else{
      socket.emit('refresh-id', userId);
    }
    socket.on('reconnect', (attempt) => {
      socket.emit('refresh-id', userId);
    })
    socket.on('set-id', id => {
      localStorage.setItem('userId', id);
      setUserId(id);
    })
  },[]);

  return (
    <AppContext.Provider value={
      {
        userId: userId,
        username: username,
        socket: socket,
        setScreen,
        setUsername,
        room,
        setRoom
      }
    }>
      <img
        width="100%"
        style={{ position: "absolute" }}
        src="/images/placeholder_logo.jpg"
      />
      {
        screen === "LOBBY" ? <LobbyScreen /> : 
        screen === "QUESTION" ? <QuestionScreen /> :
        <MenuScreen />
      }
    </AppContext.Provider>
  )
}
