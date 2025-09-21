'use client'

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Use the current window location for socket connection
    const socketUrl = process.env.NODE_ENV === 'production' ? '' : window.location.origin
    console.log('Connecting to socket at:', socketUrl)
    const newSocket = io(socketUrl)
    
    newSocket.on('connect', () => {
      console.log('Socket connected!')
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected!')
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  return { socket, isConnected }
}
