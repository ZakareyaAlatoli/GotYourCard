const express = require('express')
const app = express();
const { Server } = require('socket.io');

app.get('/getid', (req, res) => {

})

const io = new Server(
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started`);
  })
);