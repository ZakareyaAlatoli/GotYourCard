import { useEffect, useState } from "react"
import {io} from 'socket.io-client'

function App(props) {
  const [socket, setSocket] = useState(io(import.meta.env.VITE_GAME_SERVER));

  useEffect(() => {
    socket.on('ping', onPing);
  },[socket])

  function onPing(){
    console.log('pong');
  }
  function pingServer(){
    console.log('Pinging server...');
    socket.emit('ping');
  }

  return (
    <>
      <h1>{props.playerID}</h1>
      <button onClick={pingServer}>PING SERVER</button>
    </>
  )
}

export default App
