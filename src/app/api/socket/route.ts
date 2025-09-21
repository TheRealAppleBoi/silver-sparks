import { NextRequest } from 'next/server'
import { Server as ServerIO } from 'socket.io'
import { Server as NetServer } from 'http'
import { Socket as NetSocket } from 'net'

interface SocketServer extends NetServer {
  io?: ServerIO | undefined
}

interface SocketWithIO extends NetSocket {
  server: SocketServer
}

interface NextApiResponseWithSocket extends NextRequest {
  socket: SocketWithIO
}

// In-memory queue for matching users
const queue: Array<{ socketId: string; token: string }> = []

export default function handler(req: NextRequest, res: NextApiResponseWithSocket) {
  if (res.socket.server.io) {
    console.log('Socket is already running')
    res.end()
    return
  }

  console.log('Socket is initializing')
  const io = new ServerIO(res.socket.server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
      methods: ['GET', 'POST'],
    },
  })

  res.socket.server.io = io

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

  res.end()
}
