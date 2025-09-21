'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react'
import { useLocalStream } from '@/hooks/useLocalStream'
import { useSocket } from '@/hooks/useSocket'
import SimplePeer from 'simple-peer'

interface VideoCallProps {
  peerId: string
  onEndCall: () => void
}

export default function VideoCall({ peerId, onEndCall }: VideoCallProps) {
  const [isMuted, setIsMuted] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const [error, setError] = useState('')
  
  const { stream, videoRef, startStream, stopStream } = useLocalStream()
  const { socket } = useSocket()
  const peerRef = useRef<SimplePeer.Instance | null>(null)
  const peerVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!stream) {
      startStream()
    }
  }, [stream, startStream])

  useEffect(() => {
    if (!socket || !stream) return

    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream: stream
    })

    peerRef.current = peer

    peer.on('signal', (data) => {
      socket.emit('offer', { peerId, offer: data })
    })

    peer.on('stream', (remoteStream) => {
      if (peerVideoRef.current) {
        peerVideoRef.current.srcObject = remoteStream
        setIsConnected(true)
        setIsConnecting(false)
      }
    })

    peer.on('error', (err) => {
      console.error('Peer connection error:', err)
      setError('Connection issue—try again?')
    })

    socket.on('answer', (data) => {
      if (data.peerId === peerId) {
        peer.signal(data.answer)
      }
    })

    socket.on('ice-candidate', (data) => {
      if (data.peerId === peerId) {
        peer.signal(data.candidate)
      }
    })

    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      if (!isConnected) {
        setError('Tricky connection—ending and trying again?')
        setTimeout(() => onEndCall(), 2000)
      }
    }, 10000)

    return () => {
      clearTimeout(timeout)
      if (peerRef.current) {
        peerRef.current.destroy()
      }
    }
  }, [socket, stream, peerId, isConnected, onEndCall])

  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOn(videoTrack.enabled)
      }
    }
  }

  const handleEndCall = () => {
    if (window.confirm('Sure? You\'ll be back home safely.')) {
      if (peerRef.current) {
        peerRef.current.destroy()
      }
      stopStream()
      socket?.emit('end-call', { peerId })
      onEndCall()
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <PhoneOff className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-red-600 mb-4 font-serif">
            Connection Issue
          </h1>
          <p className="text-xl text-gray-600 mb-8">{error}</p>
          <button
            onClick={onEndCall}
            className="bg-blue-500 hover:bg-blue-600 text-white text-xl font-semibold py-4 px-8 rounded-2xl transition-colors duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-lg p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 font-serif">
          Chatting with a new friend! 💬
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full transition-colors duration-200 ${
              isMuted ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <button
            onClick={handleEndCall}
            className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-colors duration-200"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
          {/* Your Video */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gray-100 p-2 text-center text-sm text-gray-600">
              You {isMuted && '(Muted)'}
            </div>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          {/* Peer Video */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gray-100 p-2 text-center text-sm text-gray-600">
              Your New Friend
            </div>
            {isConnecting ? (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg text-gray-600">Connecting...</p>
                </div>
              </div>
            ) : (
              <video
                ref={peerVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white shadow-lg p-6">
        <div className="flex items-center justify-center space-x-6">
          <button
            onClick={toggleMute}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-colors duration-200 ${
              isMuted 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          <button
            onClick={toggleVideo}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-colors duration-200 ${
              !isVideoOn 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {!isVideoOn ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            <span>{!isVideoOn ? 'Turn On Camera' : 'Turn Off Camera'}</span>
          </button>

          <button
            onClick={handleEndCall}
            className="flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-semibold transition-colors duration-200"
          >
            <PhoneOff className="w-5 h-5" />
            <span>End Call</span>
          </button>
        </div>
      </div>
    </div>
  )
}
