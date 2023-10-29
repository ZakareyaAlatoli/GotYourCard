import { useState } from "react"
import connect from './services/socketClient';

function App(props) {
  const [socket, setSocket] = useState(connect(import.meta.env.GAME_SERVER));

  return (
    <>
      <h1>{props.playerID}</h1>
    </>
  )
}

export default App
