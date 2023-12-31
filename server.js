import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import * as firebase from './Database/firebase.js'; 
import * as login from "./Database/login.js"


const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.emit('serverLog', 'New client connected'); 

  socket.on('signup',async  (UserName, Email, password) => {
    
    if (!UserName || !Email || !password) {
      console.error('Signup failed: Missing required fields');
      socket.emit('serverLog', 'Signup failed: Missing required fields');
      return; // Stop further execution if validation fails
    }
    
    await login.SignUpUser(UserName, Email, password)
      .then(() => {
        console.log('Signup successful');
        socket.emit('serverLog', 'Signup successful'); 
      })
      .catch((error) => {
        console.error('Signup failed:', error);
        socket.emit('serverLog', 'Signup failed: ' + error); 
      });
  });

  socket.on('login',  async (username, password) => {
  
    const result = await login.loginUser(username, password);


    if (result.success) {
      console.log("success")
      socket.emit('loginSuccess', result);
    } else {
 
      socket.emit('loginFailed', result);
    }
  });


  socket.on('checkUnique',  async (username) => {
    
    const isUnique = await firebase.isUsernameUnique(username); 
    console.log(isUnique); 
    socket.emit('UsernameUnique', isUnique);
    
  });


  socket.on('disconnect', () => {
    console.log('Client disconnected');
    socket.emit('serverLog', 'Client disconnected');
  });
});

server.listen(4000,'0.0.0.0', () => {
  console.log('Listening on port 4000');
});
