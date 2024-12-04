import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  
  try {
    const response = await fetch(process.env.RUNPOD_ENDPOINT!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 