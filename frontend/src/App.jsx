import { useEffect, useState, createContext, useContext } from "react"
import {io} from 'socket.io-client'
import './App.css'
import Screen from "./Screen";
import LoadingIcon from "./LoadingIcon";
import { Screens } from "./AppConstants";

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
    socket.on('room-players-change', room => {
      setRoom(room);
    })
    socket.on('error', error => {
      setLoading(false);
      console.error(error);
      if(typeof(error) == 'string')
        setMessage(error);
      else 
        setMessage('An error has occurred');
    })
    socket.on('set-name', name => {
      setUsername(name);
    })
  },[]);


  useEffect(() => {
    setMessageOpacity(1);
    setTimeout(() => {
      setMessageOpacity(0);
    },4000);
  },[message]);

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
        setMessage
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
        top: '10%',
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
