import io from 'socket.io-client';
import * as firebase from "./Database/firebase.js"
import * as login from "./Database/login.js"


const userName = "newUser2";
const email = "newUser@example.com";
const password = "securePassword";



const socket = io('http://localhost:4000');

socket.on('connect', () => {
    console.log('Connected to server');
  }); 
socket.emit('checkUnique', userName); 

socket.on('UsernameUnique', (isunique) =>{ 
    console.log(isunique); 
}); 


