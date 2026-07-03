import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Proxies carimagery.com so the browser never has to deal with its XML
// response or CORS. Takes ?q=make+model+year and returns { imageUrl }.
// carimagery is free and needs no key. If it has no photo for a car it
// returns an empty/placeholder string, which we treat as null so the card
// falls back to its icon.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q) {
    return NextResponse.json({ imageUrl: null }, { status: 400 })
  }

  try {
    const endpoint = `http://www.carimagery.com/api.asmx/GetImageUrl?searchTerm=${encodeURIComponent(q)}`

    // carimagery can be slow — abort if it takes longer than 6s
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)

    const res = await fetch(endpoint, {
      headers: { Accept: 'text/xml' },
      cache: 'no-store',
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!res.ok) {
      return NextResponse.json({ imageUrl: null })
    }

    const xml = await res.text()

    // Response looks like:
    // <string xmlns="http://carimagery.com/">http://.../car.jpg</string>
    const match = xml.match(/>(https?:\/\/[^<]+)</)
    const imageUrl = match ? match[1].trim() : null

    return NextResponse.json({ imageUrl })
  } catch {
    return NextResponse.json({ imageUrl: null })
  }
}
