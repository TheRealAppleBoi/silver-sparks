import { NextRequest, NextResponse } from 'next/server'
import { verifyAgeWithAudio, verifyAgeWithText } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audio = formData.get('audio') as File
    const text = formData.get('text') as string

    let verificationResult

    if (audio) {
      // Convert File to Blob for OpenAI
      const audioBlob = new Blob([await audio.arrayBuffer()], { type: audio.type })
      verificationResult = await verifyAgeWithAudio(audioBlob)
    } else if (text) {
      verificationResult = await verifyAgeWithText(text)
    } else {
      return NextResponse.json(
        { success: false, error: 'No audio or text provided' },
        { status: 400 }
      )
    }

    if (verificationResult.verified) {
      // Generate token and store in database
      const token = generateToken()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      await prisma.verification.create({
        data: {
          token,
          expiresAt
        }
      })

      return NextResponse.json({
        success: true,
        verified: true,
        token,
        expiresAt: expiresAt.toISOString(),
        reason: verificationResult.reason
      })
    } else {
      return NextResponse.json({
        success: true,
        verified: false,
        reason: verificationResult.reason
      })
    }
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Oops, let\'s try that again—technology can be tricky!',
        verified: false,
        reason: 'Something went wrong. Please try again.'
      },
      { status: 500 }
    )
  }
}
