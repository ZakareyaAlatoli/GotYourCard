import { useEffect, useState } from "react"
import {io} from 'socket.io-client'

function App(props) {
  const [socket, setSocket] = useState(io(import.meta.env.VITE_GAME_SERVER));

  useEffect(() => {
    socket.on('get-pid', onGetPID);

    return () => {
      socket.off('get-pid', onGetPID);
    }
  },[socket])

  function onGetPID(){
    socket.emit('get-pid', props.playerID);
  }
  function pingServer(){
    console.log('Pinging server...');
    socket.emit('ping');
  }

  return (
    <>
      <h1>{props.playerID}</h1>
    </>
  )
}

export default App
