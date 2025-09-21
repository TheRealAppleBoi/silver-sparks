import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'Socket.io endpoint - WebSocket connection will be established automatically',
    status: 'ready'
  })
}

export async function POST() {
  return NextResponse.json({ 
    message: 'Socket.io endpoint - WebSocket connection will be established automatically',
    status: 'ready'
  })
}
