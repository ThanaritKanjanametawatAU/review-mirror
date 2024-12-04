import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    const response = await fetch('https://escargot-renewing-reptile.ngrok-free.app/runsync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 