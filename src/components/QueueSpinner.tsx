'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Clock } from 'lucide-react'

interface QueueSpinnerProps {
  onMatched?: (peerId: string) => void
  onError?: (error: string) => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function QueueSpinner({ onMatched: _onMatched, onError: _onError }: QueueSpinnerProps) {
  // Note: onMatched and onError are optional callback props that may be used in the future
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const toggleAmbientSound = () => {
    setIsPlaying(!isPlaying)
    // In a real app, you'd play ambient sounds here
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      {/* Floating Sparkles Animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-300 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center relative z-10">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4 font-serif">
            Finding a Fellow Spark... ✨
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            This usually takes under 30 seconds! We&apos;re matching you with another verified senior.
          </p>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <Clock className="w-6 h-6 text-blue-500" />
          <span className="text-2xl font-semibold text-gray-700">
            {formatTime(timeElapsed)}
          </span>
        </div>

        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Ambient Sound Toggle */}
        <button
          onClick={toggleAmbientSound}
          className={`px-6 py-3 rounded-2xl font-semibold transition-colors duration-200 ${
            isPlaying 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isPlaying ? '🔊 Ambient Sounds On' : '🔇 Play Ambient Sounds'}
        </button>

        {/* Encouraging Messages */}
        <div className="mt-8 text-lg text-gray-500">
          {timeElapsed < 10 && "Just a moment..."}
          {timeElapsed >= 10 && timeElapsed < 20 && "Almost there..."}
          {timeElapsed >= 20 && timeElapsed < 30 && "Great things take time..."}
          {timeElapsed >= 30 && "Your perfect match is coming..."}
        </div>
      </div>
    </div>
  )
}
