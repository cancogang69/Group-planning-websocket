import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { useAzureSocketIO } from "@azure/web-pubsub-socket.io";
import { signUp } from "./database/user/signup.js"
import { login } from "./database/user/login.js"
import { addProject } from "./database/project/newProject.js"
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// useAzureSocketIO(io, {
//   hub: "Hub",
//   connectionString: "Endpoint=https://group-planning.webpubsub.azure.com;AccessKey=Ow0VM8Hph/A/6/T35kWhmJy6sRPimRxS/3Nr97jgMx0=;Version=1.0;"
// });

io.on('connection', (socket) => {
  console.log(`${socket.id} connected`);
  socket.emit('handshake', `Hello ${socket.id}!`); 

  socket.on('sign-up', async (userName, email, password) => {
    if (!userName || !email || !password) {
      socket.emit('sign-up log', 'Signup failed: Missing required fields');
      return; // Stop further execution if validation fails
    }
    
    await signUp(userName, email, password)
      .then(() => {
        socket.emit('sign-up log', 'Signup successful'); 
      })
      .catch((error) => {
        socket.emit('sign-up log', error.message); 
      });
  });

  socket.on('login', async (username, password) => {
    const result = await login(username, password);

    if (result.success) {
      console.log("success")
      socket.emit('login log', result);
    } else {
      socket.emit('login log', result);
    }
  });

  socket.on('newProject', async (projectData) => {
    await addProject(projectData)
      .then(() => {
        socket.emit('new-project log', 'Project added successfully'); 
      })
      .catch((error) => {
        socket.emit('new-project log', error.message); 
      });
  });

  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected!`);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
