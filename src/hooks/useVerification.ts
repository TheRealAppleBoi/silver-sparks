'use client'

import { useState, useEffect } from 'react'

export function useVerification() {
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkVerification = () => {
      const token = localStorage.getItem('verification_token')
      const expiresAt = localStorage.getItem('verification_expires_at')
      
      if (token && expiresAt) {
        const expirationDate = new Date(expiresAt)
        if (new Date() < expirationDate) {
          setIsVerified(true)
        } else {
          localStorage.removeItem('verification_token')
          localStorage.removeItem('verification_expires_at')
        }
      }
      setIsLoading(false)
    }

    checkVerification()
  }, [])

  const setVerified = (token: string, expiresAt: string) => {
    localStorage.setItem('verification_token', token)
    localStorage.setItem('verification_expires_at', expiresAt)
    setIsVerified(true)
  }

  const clearVerification = () => {
    localStorage.removeItem('verification_token')
    localStorage.removeItem('verification_expires_at')
    setIsVerified(false)
  }

  return {
    isVerified,
    isLoading,
    setVerified,
    clearVerification
  }
}
