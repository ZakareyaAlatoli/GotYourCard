function attachSocketMessages(server){
  server.on('connection', socket => {
    console.log(`${socket.request.connection.remoteAddress} connected`);
    //Listen for client messages
    socket.on('ping', () => {
      socket.emit('ping');
    })
  })
}

module.exports = {attachSocketMessages};