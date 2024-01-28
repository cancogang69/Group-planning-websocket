import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { useAzureSocketIO } from "@azure/web-pubsub-socket.io";
import { signUp } from "./database/user/signup.js"
import { login } from "./database/user/login.js"  
import { addProject, getProject, deleteProject, addMember } from './database/project/Project.js';
import { getTask, addTask} from './database/project/Task.js';
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
  connectionString: "Endpoint=https://group-planning-websocket.webpubsub.azure.com;AccessKey=DK9yWWQORYpXgv2dqGY4bCznQ6HHXSHKy0WZrW2hY8Y=;Version=1.0;"
}
await useAzureSocketIO(io, azureConfig);

let socket_user = {}

function hasAllFieldsIn(fields, obj) {
  const keys = Object.keys(obj);
  return fields.every(item => keys.indexOf(item) >= 0 && obj[item] &&
                      !(Array.isArray(obj[item]) && !obj[item].length));
}

function isUserOnline(email) {
  return socket_user.hasOwnProperty(email)
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

const projectField = [
  "title",
  "createdAt",
  "master",
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
        socket.emit('user log', "Signup successful")
      })
      .catch((error) => {
        socket.emit('user log', error.message)
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
            socket.emit('user log', "Login successful", user)
            socket.join(user.sharedIDs)
            console.log(user)
          })
          .catch((error) => {
            socket.emit("user log", error.message, null)
          })
  });

  // Project section
  socket.on("add project", async (projectData) => {
    if(!hasAllFieldsIn(projectField, projectData)) {
      socket.emit("add project log", `Update project: ${MISSING}`)
      return
    }

    await addProject(projectData)
          .then((project) => {
            socket.emit("add project log", "Add project successful", project)
            socket.join(project.id)
          })
          .catch((error) => {
            socket.emit("add project log", error.message, null)
          })
  })

  socket.on("add member", async (projectID, master, member) => {
    if(!master || !member) {
      socket.emit("add member log", "Missing owner or user")
      return
    }

    await addMember(projectID, master, member)
      .then((prjID) => {
        socket.emit("add member log", "Project change successful")
      })
      .catch((error) => {
        socket.emit("add member log", error.message)
      })
  })

  socket.on("get projects", async (email) => {
    if(!email) {
      socket.emit("get project log", "Missing owner or user")
      return
    }
    
    await getProject(email)
      .then((sharedPrj) => {
        socket.emit("shared projects", "True", sharedPrj)
      })
      .catch((message) => {
        socket.emit("shared projects", message, null)
      })
  })

  
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
  
  socket.on('delete project', async (projectId) => {
    try {
      await deleteProject(projectId);
      socket.emit('del project log', 'Project deleted successfully');
    } catch (error) {
      console.error('del project log', error.message);
    }
  });

  socket.on("get task", async (projectID) => {
    await getTask(projectID)
      .then((tasks) => {
        socket.emit("return task log", "Get task successful", tasks)
      }) 
      .catch((error)=> {
        socket.emit("return task log", error.message, null)
      })
  })

  socket.on("add task", async (taskData, projectID) => {
    await addTask(taskData, projectID)
      .then(() => {
        socket.emit("add task log", "Add task successful")
      }) 
      .catch((error)=> {
        socket.emit("add task log", error.message)
      })
  })

  




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
  // .get("/negotiate", async (req, res) => {
  //   res.json({
  //     endpoint: "https://group-planning-websocket.webpubsub.azure.com",
  //     path: "/clients/socketio/hubs/group-planning"
  //   })
  // })

const port = process.env.PORT || 4000 
server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
