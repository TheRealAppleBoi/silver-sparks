'use client'

import { useState, useRef } from 'react'
import { Mic, MicOff, Send, Loader2 } from 'lucide-react'

interface VerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onVerified: (token: string, expiresAt: string) => void
}

export default function VerificationModal({ isOpen, onClose, onVerified }: VerificationModalProps) {
  const [step, setStep] = useState<'welcome' | 'recording' | 'processing' | 'text' | 'success' | 'error'>('welcome')
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [textInput, setTextInput] = useState('')
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setStep('recording')

      // Auto-stop after 15 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop()
          setIsRecording(false)
          setStep('processing')
          processAudio()
        }
      }, 15000)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      setError('Unable to access microphone. Please try the text option instead.')
      setStep('text')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setStep('processing')
      processAudio()
    }
  }

  const processAudio = async () => {
    try {
      const formData = new FormData()
      if (audioBlob) {
        formData.append('audio', audioBlob, 'audio.webm')
      } else {
        formData.append('text', textInput)
      }

      const response = await fetch('/api/verify', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success && result.verified) {
        setStep('success')
        onVerified(result.token, result.expiresAt)
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        setError(result.reason || 'Verification failed. Please try again.')
        setStep('error')
        setRetryCount(prev => prev + 1)
      }
    } catch (err) {
      console.error('Verification error:', err)
      setError('Oops, let\'s try that again—technology can be tricky!')
      setStep('error')
    }
  }

  const handleTextSubmit = () => {
    if (textInput.trim().length < 10) {
      setError('Please share a bit more about your experience.')
      return
    }
    setStep('processing')
    processAudio()
  }

  const reset = () => {
    setStep('welcome')
    setError('')
    setAudioBlob(null)
    setTextInput('')
    setRetryCount(0)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Progress Bar */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold ${
                step === 'welcome' || step === 'recording' || step === 'text' ? 'bg-blue-500' : 'bg-green-500'
              }`}>
                {step === 'recording' ? <Mic className="w-6 h-6" /> : '1'}
              </div>
              <div className="w-16 h-1 bg-gray-300 rounded"></div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold ${
                step === 'processing' ? 'bg-blue-500' : step === 'success' ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                {step === 'processing' ? <Loader2 className="w-6 h-6 animate-spin" /> : '2'}
              </div>
              <div className="w-16 h-1 bg-gray-300 rounded"></div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold ${
                step === 'success' ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                3
              </div>
            </div>
          </div>

          {/* Content */}
          {step === 'welcome' && (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 font-serif">
                Welcome to Silver Sparks! ✨
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                To keep this space safe for seniors, let's quickly confirm you're 65+. 
                Just share a short voice note about your favorite memory—no video needed yet.
              </p>
              <div className="space-y-4">
                <button
                  onClick={startRecording}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xl font-semibold py-4 px-8 rounded-2xl transition-colors duration-200 flex items-center justify-center space-x-3"
                >
                  <Mic className="w-6 h-6" />
                  <span>Record Your Memory</span>
                </button>
                <button
                  onClick={() => setStep('text')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xl font-semibold py-4 px-8 rounded-2xl transition-colors duration-200"
                >
                  Use Text Instead
                </button>
              </div>
            </div>
          )}

          {step === 'recording' && (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 font-serif">
                Recording... 🎤
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Share your favorite memory or life experience. We'll stop recording automatically after 15 seconds.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <Mic className="w-10 h-10 text-white" />
                </div>
                <button
                  onClick={stopRecording}
                  className="bg-red-500 hover:bg-red-600 text-white text-xl font-semibold py-4 px-8 rounded-2xl transition-colors duration-200 flex items-center space-x-3"
                >
                  <MicOff className="w-6 h-6" />
                  <span>Stop Recording</span>
                </button>
              </div>
            </div>
          )}

          {step === 'text' && (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 font-serif">
                Tell Us About Yourself 📝
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                What's one thing you've learned in your 65+ years? Share a brief story or wisdom.
              </p>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Share your wisdom or a favorite memory..."
                className="w-full h-32 p-4 border-2 border-gray-300 rounded-2xl text-lg resize-none focus:border-blue-500 focus:outline-none"
              />
              <div className="mt-6 space-x-4">
                <button
                  onClick={handleTextSubmit}
                  disabled={textInput.trim().length < 10}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-xl font-semibold py-4 px-8 rounded-2xl transition-colors duration-200 flex items-center space-x-3 mx-auto"
                >
                  <Send className="w-6 h-6" />
                  <span>Submit</span>
                </button>
                <button
                  onClick={() => setStep('welcome')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xl font-semibold py-4 px-8 rounded-2xl transition-colors duration-200"
                >
                  Back to Voice
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 font-serif">
                AI is Thinking... 🤔
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Taking a moment to verify your information. This usually takes just a few seconds!
              </p>
              <div className="flex items-center justify-center">
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-green-600 mb-4 font-serif">
                Welcome to Silver Sparks! 🎉
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                You're all set! You can now enter the Spark Room and connect with fellow seniors.
              </p>
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <span className="text-3xl">✨</span>
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-red-600 mb-4 font-serif">
                {retryCount >= 3 ? 'Not Today' : 'Let\'s Try Again'}
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                {retryCount >= 3 
                  ? 'Not today—try tomorrow for freshness! Sometimes a fresh perspective helps.'
                  : error || 'Hmm, that didn\'t quite match—want to try again with a different story?'
                }
              </p>
              {retryCount < 3 && (
                <div className="space-x-4">
                  <button
                    onClick={reset}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-xl font-semibold py-4 px-8 rounded-2xl transition-colors duration-200"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={onClose}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xl font-semibold py-4 px-8 rounded-2xl transition-colors duration-200"
                  >
                    Maybe Later
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Close button */}
          {step !== 'success' && step !== 'processing' && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
