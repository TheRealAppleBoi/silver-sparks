'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSocket } from '@/hooks/useSocket'
import { useVerification } from '@/hooks/useVerification'
import QueueSpinner from '@/components/QueueSpinner'

export default function QueuePage() {
  const { socket, isConnected } = useSocket()
  const { isVerified, isLoading } = useVerification()
  const router = useRouter()
  const [isInQueue, setIsInQueue] = useState(false)

  useEffect(() => {
    if (!isLoading && !isVerified) {
      router.push('/')
      return
    }

    if (isVerified && socket && isConnected && !isInQueue) {
      const token = localStorage.getItem('verification_token')
      if (token) {
        socket.emit('join-queue', { token })
        setIsInQueue(true)
      }
    }
  }, [isVerified, isLoading, socket, isConnected, isInQueue, router])

  useEffect(() => {
    if (!socket) return

    const handleMatched = (data: { peerId: string }) => {
      console.log('Matched with peer:', data.peerId)
      router.push(`/call/${data.peerId}`)
    }

    const handleDisconnect = () => {
      console.log('Socket disconnected')
      router.push('/')
    }

    socket.on('matched', handleMatched)
    socket.on('disconnect', handleDisconnect)

    return () => {
      socket.off('matched', handleMatched)
      socket.off('disconnect', handleDisconnect)
    }
  }, [socket, router])

  useEffect(() => {
    return () => {
      if (socket && isInQueue) {
        socket.emit('leave-queue')
      }
    }
  }, [socket, isInQueue])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4 font-serif">
            Verification Required
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Please verify your age first to join the queue.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white text-xl font-semibold py-4 px-8 rounded-2xl transition-colors duration-200"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center">
          <h1 className="text-3xl font-bold text-yellow-600 mb-4 font-serif">
            Connecting...
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Check your connection, dear friend. We're trying to connect you to the queue.
          </p>
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  return <QueueSpinner onMatched={() => {}} onError={() => {}} />
}
