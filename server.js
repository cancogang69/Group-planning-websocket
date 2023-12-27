import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { addUserData, getUserData, updateUserData } from './Database/firebase.js'; 

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(4000, () => {
  console.log('Listening on port 4000');
});
