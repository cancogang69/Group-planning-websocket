import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { useAzureSocketIO } from "@azure/web-pubsub-socket.io";
import { signUp } from "./database/user/signup.js"
import { login } from "./database/user/login.js"
import { addMember } from './database/project/addMember.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// use this when use azure webpub sub for socket.io
const azureConfig = {
  hub: "group_planning",
  connectionString: "Endpoint=https://group-planning-websocket.webpubsub.azure.com;AccessKey=h8zR5JnZVFT8bjzR1DGKoJZQStP1uZ60vDnbv2uUZI4=;Version=1.0;"
}
await useAzureSocketIO(io, azureConfig);

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
  "ownerID"
]

const projectField = [
  "title",
  "status",
  "start_date",
  "end_date",
  "ownerID",
  "memberID"
]

const MISSING = "Missing required fields"

io.on('connection', (socket) => {
  console.log(`${socket.id} connected`);
  socket.emit('handshake', `Hello ${socket.id}!`); 

  // User section
  socket.on('sign-up', async (userData) => {
    if (!hasAllFieldsIn(signupField, userData)) {
      socket.emit('user log', `Signup failed: ${MISSING}`);
      return
    }

    await signUp(userData)
      .then((newUser) => {
        socket.emit('user log', 'Signup successful'); 
        socket.emit('user change', newUser )
      })
      .catch((error) => {
        socket.emit('user log', error.message); 
      });
  });

  socket.on('login', async (userData) => {
    if (!hasAllFieldsIn(loginField, userData)) {
      socket.emit("user log", `Login failed: ${MISSING}`)
      return
    }

    await login(userData.email, userData.password)
          .then(user => {
            console.log("Login successful")
            socket.emit('user log', "Login successful")
            socket.emit("user change", user)
            socket.join(user.sharedIDs)
          })
          .catch((error) => {
            socket.emit("user log", error.message)
          })
  });

  // Project section
  socket.on("init project", async (projectData) => {
    if(!hasAllFieldsIn(projectInitField, projectData)) {
      socket.emit("project log", `Init project: ${MISSING}`)
      return
    }

    //init project
  })

  socket.on("add project member", async (projectData, ownerEmail, newEmail) => {
    if(!hasAllFieldsIn(projectData)) {
      socket.emit("project log", `Project data: ${MISSING}`)
      return
    }

    if(!ownerEmail || !newEmail) {
      socket.emit("project log", `Missing owner or new member email`)
      return 
    }

    // add project member
  })

  socket.on("remove project member", async (projectData, ownerEmail, memberEmail) => {
    if(!hasAllFieldsIn(projectData)) {
      socket.emit("project log", `Project data: ${MISSING}`)
      return
    }

    if(!ownerEmail || !memberEmail) {
      socket.emit("project log", `Missing owner or new member email`)
      return 
    }

    // remove project member
  })

  socket.on("add new task", async (projecData, task) => {
    if(!hasAllFieldsIn(projecData)) {
      return
    }
  })

  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected!`);
  });
});

app
  .get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html")
  })
  .get("/negotiate", async (req, res) => {
  res.json({
    endpoint: "https://group-planning-websocket.webpubsub.azure.com",
    path: "/clients/socketio/hubs/group-planning"
  })
})

const port = process.env.PORT || 8080 
server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
