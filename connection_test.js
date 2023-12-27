import io from 'socket.io-client';

const socket = io('http://localhost:4000');

function test_server(){
  socket.on('connect', () => {
    console.log('Connected to server');
  });

}

test_server()