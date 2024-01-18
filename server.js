import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { useAzureSocketIO } from "@azure/web-pubsub-socket.io";
import { signUp } from "./database/user/signup.js"
import { login } from "./database/user/login.js"
//import { addMember } from './database/project/addMember.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { addProject, getProject, deleteProject } from './database/project/Project.js';
import { addTask, updateTask, getTask, deleteTask } from './database/project/Task.js';
import { uploadAva, downloadAva } from './database/user/profile.js';

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
    socket.emit('sign-up log', "connect...")
    await signUp(userData)
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
    await login(userData.email, userData.password)
          .then(user => {
            console.log("login successful")
            socket.emit('user log', "login successful")
            socket.emit("user change", user)
            socket.join(user.sharedIDs)
            console.log(user)
          })
          .catch((error) => {
            socket.emit("user log", error.message)
          })
  });

  socket.on("init project", async (projectData) => {
    if(!hasAllFieldsIn(projectInitField, projectData)) {
      socket.emit("project log", `Init project: ${MISSING}`)
      return
    }

    //init project
  })

  socket.on("add project member", async (projecData, ownerEmail, userEmail) => {
    if(!hasAllFieldsIn(projecData)) {
      socket.emit("project log", `Project data: ${MISSING}`)
      return
    }

    if(!ownerEmail || !userEmail) {
      socket.emit("project log", "Missing owner or user")
      return
    }

    // add project member
  })

  // socket.on("add new task", async (projecData, task) => {
  //   if(!hasAllFieldsIn(projecData)) {
  //     return
  //   }
  // })

    //PROJECT
    socket.on('newProject', async (projectData) => {
      await addProject(projectData)
        .then(() => {
          socket.emit('new-project log', 'Project added successfully'); 
        })
        .catch((error) => {
          socket.emit('new-project log', error.message); 
        });
    });
  
  socket.on('getProject', async () => {
    try {
      const projects = await getProject();
      socket.emit('Projects', projects);
    } catch (error) {
      socket.emit('error', error);
      console.error('Error getting projects:', error);
    }
  });
  
  socket.on('deleteProject', async (projectId) => {
    try {
      await deleteProject(projectId);
      socket.emit('deleteProject', 'Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  });


  //Tasks
socket.on('newTask', async (task) => {
  try {
    console.log(task);
    await addTask(task);
    socket.emit('newTask log', 'Task added successfully');
  } catch (error) {
    console.error('Error adding task:', error);
  }
});

socket.on('getTask', async () => {
  try {
    const tasks = await getTask();
    socket.emit('Tasks', tasks);
  } catch (error) {
    socket.emit('error', error);
    console.error('Error getting tasks:', error);
  }
});

socket.on('deleteTask', async (taskId) => {
  try {
    await deleteTask(taskId);
    socket.emit('deleteTask log', 'Task deleted successfully');
  } catch (error) {
    console.error('Error deleting task:', error);
  }
});

socket.on('updateTask', async (taskID, task) => {
  try {
    console.log(taskID);
    await updateTask(taskID, task);
    socket.emit('updateTask log', 'Task updated successfully');
  } catch (error) {
    console.error('Error updating task:', error);
  }
});

//Profile Image
socket.on('uploadAva', async (file, id) => {
  try {
    await uploadAva(file, id);
    socket.emit('upload', 'upload image successfully');
  } catch (e) {
    console.error(e);
  }
});

socket.on('downloadAva', async (id) => {
  try {
    const avaURL = await downloadAva(id);
    socket.emit('download', avaURL); // Send the actual image URL to the client
  } catch (e) {
    console.error('Error:', e);
    socket.emit('download', null); // Send null or an error message to indicate failure
  }
});

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

const port = process.env.PORT || '8080' 
server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});