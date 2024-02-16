import { useEffect, useState, createContext, useContext } from "react"
import {io} from 'socket.io-client'
import './App.css'
import Screen from "./Screen";
import LoadingIcon from "./LoadingIcon";

export const AppContext = createContext();

export default function App() {
  //TODO: change to use env var
  const [socket, setSocket] = useState(io(import.meta.env.VITE_GAME_SERVER));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [username, setUsername] = useState();
  const [room, setRoom] = useState({});
  const [loading, setLoading] = useState(false);
  const [messageOpacity, setMessageOpacity] = useState(0);
  const [message, setMessage] = useState();
  var messageTimer;

  function displayMessage(newMessage){
    setMessage(newMessage);
    setMessageOpacity(1);
    if(messageTimer){
      clearTimeout(messageTimer);
    }
    messageTimer = setTimeout(() => {
      setMessageOpacity(0);
    },4000);
  }

  useEffect(() => {
    if(!userId){
      console.log('No id detected');
      socket.emit('set-id');
    }
    else{
      socket.emit('refresh', userId);
    }
    socket.on('reconnect', () => {
      socket.emit('refresh', userId);
    })
    socket.on('set-id', id => {
      localStorage.setItem('userId', id);
      setUserId(id);
    })
    socket.on('room-players-change', room => {
      setRoom(room);
    })
    socket.on('error', error => {
      setLoading(false);
      console.error(error);
      if(typeof(error) == 'string')
        displayMessage(error);
      else 
        displayMessage('An error has occurred. Try refreshing.');
    })
    socket.on('set-name', name => {
      setUsername(name);
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
        setUsername,
        room,
        setRoom,
        displayMessage
      }
    }>
      {loading?<LoadingIcon />:null}
      <div style={{ 
        opacity: messageOpacity,
        transition: 'opacity 0.3s',
        position: "fixed", 
        zIndex: 2,
        backgroundColor: 'white',
        borderRadius: '5px',
        margin: 'auto',
        left: '10%',
        top: '40%',
        width: '80%',
        textAlign: 'center',
        fontWeight: '400',
        padding: message ? '5px' : '0',
        color: 'black',
        pointerEvents: 'none'
      }}
      >
        {message}
      </div>
      <img
        width="100%"
        style={{ position: "absolute" }}
        src="/images/placeholder_logo.jpg"
      />
      <Screen />
    </AppContext.Provider>
  )
}
