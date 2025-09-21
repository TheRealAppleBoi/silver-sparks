const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// In-memory queue for matching users
const queue = []

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true)
      const { pathname, query } = parsedUrl

      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  const io = new Server(httpServer, {
    cors: {
      origin: dev ? ['http://localhost:3000', 'http://localhost:3001'] : false,
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

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
