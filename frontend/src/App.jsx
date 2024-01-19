import { useEffect, useState, createContext, useContext } from "react"
import {io} from 'socket.io-client'
import './App.css'

export default function App() {
  const [socket, setSocket] = useState(io('ws://localhost:3000'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const AppContext = createContext();

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
        userId: userId
      }
    }>
      {userId}
    </AppContext.Provider>
  )
}

export function useUser(){
  return useContext(AppContext);
}
