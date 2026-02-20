import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'Missing URL' }, { status: 400 })
  }

  console.log('Capture request for:', url)

  return NextResponse.json({
    message: 'API is working',
    url
  })
}