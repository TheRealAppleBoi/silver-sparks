'use client'

import { useState, useEffect, useRef } from 'react'

export function useLocalStream() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const startStream = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error('Error accessing media devices:', err)
      setError('Unable to access camera or microphone. Please check your permissions.')
    } finally {
      setIsLoading(false)
    }
  }

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  useEffect(() => {
    return () => {
      stopStream()
    }
  }, [])

  return {
    stream,
    videoRef,
    isLoading,
    error,
    startStream,
    stopStream
  }
}
