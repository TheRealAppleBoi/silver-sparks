import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Socket.io endpoint - WebSocket connection will be established automatically',
    status: 'ready'
  })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Socket.io endpoint - WebSocket connection will be established automatically',
    status: 'ready'
  })
}
