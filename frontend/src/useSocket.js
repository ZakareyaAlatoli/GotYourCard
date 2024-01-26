import { useEffect } from "react";

export default function useSocket(socket, ...eventHandlers){
    return useEffect(() => {
        eventHandlers?.forEach(eventHandler => {
            socket.on(eventHandler[0], eventHandler[1]);
        })
        return () => {
            eventHandlers?.forEach(eventHandler => {
                socket.removeAllListeners(eventHandler[0]);
            })
        }
    },[])
}