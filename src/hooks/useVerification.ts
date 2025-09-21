'use client'

import { useState, useEffect } from 'react'

export function useVerification() {
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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
        setIsVerified(false)
      }
    } else {
      setIsVerified(false)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    checkVerification()
  }, [])

  // Listen for storage changes to update verification state across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'verification_token' || e.key === 'verification_expires_at') {
        checkVerification()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
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
