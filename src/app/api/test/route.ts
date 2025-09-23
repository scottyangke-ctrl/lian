import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Test API works' });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received POST data:', body);
    return NextResponse.json({ received: body, status: 'success' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
