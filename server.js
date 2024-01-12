import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { useAzureSocketIO } from "@azure/web-pubsub-socket.io";
import { signUp } from "./database/user/signup.js"
import { login } from "./database/user/login.js"
import { addMember } from './database/project/addMember.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// use this when use azure webpub sub for socket.io
// const azureConfig = {
//   hub: "group_planning",
//   connectionString: "Endpoint=https://group-planning.webpubsub.azure.com;AccessKey=Ow0VM8Hph/A/6/T35kWhmJy6sRPimRxS/3Nr97jgMx0=;Version=1.0;"
// }
// useAzureSocketIO(io, azureConfig);

function hasAllFieldsIn(fields, obj) {
  const keys = Object.keys(obj);
  return fields.every(item => keys.indexOf(item) >= 0 && obj[item] &&
                      !(Array.isArray(obj[item]) && !obj[item].length));
}

const signupField = [
  "name", 
  "email",
  "password"
]

const loginField = [
  "email",
  "password"
]

const projectInitField = [
  "title",
  "status",
  "start_date",
  "end_date",
  "ownerID",
  "isShared"
]

const MISSING = "Missing required fields"

io.on('connection', (socket) => {
  console.log(`${socket.id} connected`);
  socket.emit('handshake', `Hello ${socket.id}!`); 

  //sign up section
  socket.on('sign-up', async (userData) => {
    if (!hasAllFieldsIn(signupField, userData)) {
      socket.emit('sign-up log', `Signup failed: ${MISSING}`);
      return
    }
    
    await signUp(userData.name, userData.email, userData.password)
      .then((newUser) => {
        socket.emit('user log', 'Signup successful'); 
        socket.emit('user change', newUser )
      })
      .catch((error) => {
        socket.emit('user log', error.message); 
      });
  });

  //login section
  socket.on('login', async (userData) => {
    if (!hasAllFieldsIn(loginField, userData)) {
      socket.emit("user log", `Login failed: ${MISSING}`)
      return
    }
    const result = await login(userData.email, userData.password);

    if (result.success) {
      console.log("login successful")
      socket.emit('user log', "login successful")
      socket.emit("user change", result.user)
      socket.join(result.user.sharedIDs)
    } else {
      console.log("login failed")
      socket.emit('user log', result);
    }
  });

  socket.on("init project", async (projectData) => {
    if(!hasAllFieldsIn(projectInitField, projectData)) {
      socket.emit("project log", `Init project: ${MISSING}`)
      return
    }

    //init project
  })

  socket.on("add project member", async (projecData, ownerEmail, userEmail) => {

  })

  socket.on("add new member", (members, newMember) => {

  })

  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected!`);
  });
});

server.listen(4000, () => {
  console.log('Listening on port 4000');
});
