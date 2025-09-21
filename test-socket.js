const { io } = require('socket.io-client');

console.log('Testing socket connection...');

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('✅ Socket connected successfully!');
  console.log('Socket ID:', socket.id);
  
  // Test joining queue
  socket.emit('join-queue', { token: 'test-token' });
  console.log('✅ Joined queue');
  
  setTimeout(() => {
    socket.disconnect();
    console.log('✅ Socket disconnected');
    process.exit(0);
  }, 2000);
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error);
  process.exit(1);
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
});

setTimeout(() => {
  console.error('❌ Connection timeout');
  process.exit(1);
}, 5000);
