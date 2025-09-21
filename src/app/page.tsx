'use client'

import { useState } from 'react'
import { useVerification } from '@/hooks/useVerification'
import VerificationModal from '@/components/VerificationModal'
import { useRouter } from 'next/navigation'
import { Heart, Info, Shield } from 'lucide-react'

export default function HomePage() {
  const [showVerification, setShowVerification] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [justVerified, setJustVerified] = useState(false)
  const { isVerified, isLoading, setVerified } = useVerification()
  const router = useRouter()

  const handleStartJourney = () => {
    if (isVerified || justVerified) {
      router.push('/queue')
    } else {
      setShowVerification(true)
    }
  }

  const handleVerified = (token: string, expiresAt: string) => {
    // Update the verification state in the hook
    setVerified(token, expiresAt)
    setJustVerified(true)
    setShowVerification(false)
    // Redirect to queue after verification
    setTimeout(() => {
      router.push('/queue')
    }, 1000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Hero Section */}
      <div 
        className="relative h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1432898633021-0e9e181a3d41?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 font-serif">
            Silver Sparks
          </h1>
          <p className="text-2xl md:text-3xl mb-8 font-light">
            Light Up Your Golden Years with a Quick Chat
          </p>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed">
            Connect safely with another senior for a spontaneous video chat. 
            Verify once, chat freely. No sign-ups, no fuss.
          </p>
          <button
            onClick={handleStartJourney}
            className="bg-white text-blue-600 text-2xl font-bold py-6 px-12 rounded-3xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            {(isVerified || justVerified) ? 'Enter the Spark Room ✨' : 'Start Your Journey'}
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16 font-serif">
            Why Silver Sparks?
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Safe & Verified</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Only verified seniors 65+ can join. Your safety and comfort are our top priority.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No Pressure</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Leave anytime, no strings attached. Just friendly conversations with fellow seniors.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Info className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Simple & Easy</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Large buttons, clear text, and intuitive design made specifically for seniors.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <button
              onClick={() => setShowHowItWorks(true)}
              className="text-lg text-blue-600 hover:text-blue-800 font-semibold"
            >
              How It Works
            </button>
            <button
              onClick={() => setShowPrivacy(true)}
              className="text-lg text-blue-600 hover:text-blue-800 font-semibold"
            >
              Privacy
            </button>
            <span className="text-lg text-gray-600 flex items-center">
              Made with <Heart className="w-5 h-5 text-red-500 mx-1" /> for Hackathon
            </span>
          </div>
          <p className="text-gray-500">
            © 2024 Silver Sparks. Bringing seniors together, one conversation at a time.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <VerificationModal
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
        onVerified={handleVerified}
      />

      {/* How It Works Modal */}
      {showHowItWorks && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 font-serif">How It Works</h2>
            <div className="space-y-6 text-lg text-gray-600">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <p>Verify your age with a quick voice message or text about your life experience</p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <p>Join the queue and wait for a match with another verified senior</p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <p>Start a video chat and enjoy a friendly conversation!</p>
              </div>
            </div>
            <button
              onClick={() => setShowHowItWorks(false)}
              className="mt-8 bg-blue-500 hover:bg-blue-600 text-white text-xl font-semibold py-3 px-8 rounded-2xl transition-colors duration-200"
            >
              Got It!
            </button>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 font-serif">Privacy Promise</h2>
            <div className="space-y-4 text-lg text-gray-600">
              <p>We don&apos;t store chats or identities—your peace of mind matters.</p>
              <p>• No chat history is saved</p>
              <p>• No personal information is collected</p>
              <p>• Verification tokens expire in 10 minutes</p>
              <p>• All video calls are peer-to-peer and private</p>
              <p>• You can leave anytime with no questions asked</p>
            </div>
            <button
              onClick={() => setShowPrivacy(false)}
              className="mt-8 bg-blue-500 hover:bg-blue-600 text-white text-xl font-semibold py-3 px-8 rounded-2xl transition-colors duration-200"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
