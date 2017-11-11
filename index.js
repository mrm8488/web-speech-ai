'use strict';

const APIAI_TOKEN = process.env.APIAI_TOKEN || 'e20f2bb4ae4e446282027812c48cfdd4';
const APIAI_SESSION_ID = process.env.APIAI_SESSION_ID || '52eebb5fad35476697046b4211e2a286';

const express = require('express');
const app = express();

app.use(express.static(__dirname + '/views')); // html
app.use(express.static(__dirname + '/public')); // js, css, images

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});

const io = require('socket.io')(server);

io.on('connection', function(socket){
  console.log('a user connected');
});

const apiai = require('apiai')(APIAI_TOKEN);

// Web UI
app.get('/', (req, res) => {
  res.sendFile('index.html');
});

io.on('connection', function(socket) {
  socket.on('chat message', (text) => {
    console.log('Message: ' + text);

    // Get a reply from API.ai

    let apiaiReq = apiai.textRequest(text, {
      sessionId: socket.id
    });

    apiaiReq.on('response', (response) => {

      console.log(response);
      console.log(response.result.fulfillment.messages);
      let aiText = response.result.fulfillment.speech;
      console.log('Bot reply: ' + aiText);
      socket.emit('bot reply', aiText);
    });

    apiaiReq.on('error', (error) => {
      console.log(error);
    });

    apiaiReq.end();

  });
});
