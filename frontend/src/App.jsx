import { useEffect, useState, createContext, useContext } from "react"
import {io} from 'socket.io-client'
import './App.css'
import MenuScreen from "./MenuScreen";
import LobbyScreen from "./LobbyScreen";
import QuestionScreen from "./QuestionScreen";
import LoadingIcon from "./LoadingIcon";

export const AppContext = createContext();



export default function App() {
  //TODO: change to use env var
  const [socket, setSocket] = useState(io('ws://localhost:3000'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [username, setUsername] = useState();
  const [room, setRoom] = useState({});
  const [screen, setScreen] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if(!userId){
      console.log('No id detected');
      socket.emit('set-id');
    }
    else{
      socket.emit('refresh', userId);
    }
    socket.on('reconnect', (attempt) => {
      socket.emit('refresh', userId);
    })
    socket.on('set-id', id => {
      localStorage.setItem('userId', id);
      setUserId(id);
    })
    socket.on('room-change', room => {
      setRoom(room);
    })
    socket.on('error', error => {
      setLoading(false);
      console.error(error);
    })
  },[]);

  return (
    <AppContext.Provider value={
      {
        userId: userId,
        username: username,
        socket: socket,
        loading,
        setLoading,
        setScreen,
        setUsername,
        room,
        setRoom
      }
    }>
      {loading?<LoadingIcon />:null}
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
