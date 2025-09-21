import { Server as ServerIO } from 'socket.io'
import { Server as NetServer } from 'http'

// In-memory queue for matching users
const queue: Array<{ socketId: string; token: string }> = []

export function initializeSocket(server: NetServer) {
  const io = new ServerIO(server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    socket.on('join-queue', (data) => {
      const { token } = data
      
      // Add user to queue
      queue.push({ socketId: socket.id, token })
      console.log('User joined queue:', socket.id, 'Queue length:', queue.length)

      // If we have at least 2 users, match them
      if (queue.length >= 2) {
        const [user1, user2] = queue.splice(0, 2)
        
        // Notify both users they've been matched
        io.to(user1.socketId).emit('matched', { peerId: user2.socketId })
        io.to(user2.socketId).emit('matched', { peerId: user1.socketId })
        
        console.log('Matched users:', user1.socketId, 'and', user2.socketId)
      }
    })

    socket.on('leave-queue', () => {
      const index = queue.findIndex(user => user.socketId === socket.id)
      if (index !== -1) {
        queue.splice(index, 1)
        console.log('User left queue:', socket.id)
      }
    })

    socket.on('offer', (data) => {
      const { peerId, offer } = data
      socket.to(peerId).emit('answer', { peerId: socket.id, answer: offer })
    })

    socket.on('answer', (data) => {
      const { peerId, answer } = data
      socket.to(peerId).emit('answer', { peerId: socket.id, answer })
    })

    socket.on('ice-candidate', (data) => {
      const { peerId, candidate } = data
      socket.to(peerId).emit('ice-candidate', { peerId: socket.id, candidate })
    })

    socket.on('end-call', (data) => {
      const { peerId } = data
      socket.to(peerId).emit('call-ended')
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
      
      // Remove user from queue if they're still in it
      const index = queue.findIndex(user => user.socketId === socket.id)
      if (index !== -1) {
        queue.splice(index, 1)
        console.log('Removed disconnected user from queue:', socket.id)
      }
    })
  })

  return io
}
