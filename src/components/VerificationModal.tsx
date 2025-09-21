'use client'

import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface VerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onVerified: (token: string, expiresAt: string) => void
}

export default function VerificationModal({ isOpen, onClose, onVerified }: VerificationModalProps) {
  const [step, setStep] = useState<'welcome' | 'text' | 'processing' | 'success' | 'error'>('welcome')
  const [textInput, setTextInput] = useState('')
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  const processText = async () => {
    try {
      const formData = new FormData()
      formData.append('text', textInput)

      const response = await fetch('/api/verify', {
        method: 'POST',
        body: formData,
      })

      // Check if response is ok and content type is JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response:', text)
        throw new Error('Server returned non-JSON response')
      }

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
    processText()
  }

  const reset = () => {
    setStep('welcome')
    setError('')
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
                step === 'welcome' || step === 'text' ? 'bg-blue-500' : 'bg-green-500'
              }`}>
                1
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
                To keep this space safe for seniors, let&apos;s quickly confirm you&apos;re 65+. 
                Please share a bit about your life experience below.
              </p>
              <button
                onClick={() => setStep('text')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xl font-semibold py-4 px-8 rounded-2xl transition-colors duration-200"
              >
                Continue with Text
              </button>
            </div>
          )}

          {step === 'text' && (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 font-serif">
                Tell Us About Yourself 📝
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                What&apos;s one thing you&apos;ve learned in your 65+ years? Share a brief story or wisdom.
              </p>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Share your wisdom or a favorite memory..."
                className="w-full h-32 p-4 border-2 border-gray-300 rounded-2xl text-lg resize-none focus:border-blue-500 focus:outline-none"
              />
              <div className="mt-6">
                <button
                  onClick={handleTextSubmit}
                  disabled={textInput.trim().length < 10}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-xl font-semibold py-4 px-8 rounded-2xl transition-colors duration-200 flex items-center space-x-3 mx-auto"
                >
                  <Send className="w-6 h-6" />
                  <span>Submit</span>
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
                You&apos;re all set! You can now enter the Spark Room and connect with fellow seniors.
              </p>
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <span className="text-3xl">✨</span>
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-red-600 mb-4 font-serif">
                {retryCount >= 3 ? 'Not Today' : 'Let&apos;s Try Again'}
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                {retryCount >= 3 
                  ? 'Not today—try tomorrow for freshness! Sometimes a fresh perspective helps.'
                  : error || 'Hmm, that didn&apos;t quite match—want to try again with a different story?'
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
