function attachSocketMessages(server){
  server.on('connection', socket => {
    console.log(`${socket} connected`);
  })
}

module.exports = {attachSocketMessages};