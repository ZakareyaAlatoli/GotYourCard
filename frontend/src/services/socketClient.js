import {io} from 'socket.io-client'

export default function connect(url){
  const socket = io(url);
  return socket;
}