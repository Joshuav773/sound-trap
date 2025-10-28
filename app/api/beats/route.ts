import { NextRequest, NextResponse } from 'next/server'
import { DatabaseStorage } from '@/server/dbStorage'

const storage = new DatabaseStorage()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ""
    const genre = searchParams.get('genre') || ""
    const key = searchParams.get('key') || ""
    const bpmRange = searchParams.get('bpmRange') || ""
    const featured = searchParams.get('featured') === 'true'
    const pendingStore = searchParams.get('pendingStore') === 'true'
    
    let beats = await storage.searchBeats(search, {
      genre,
      key,
      bpmRange,
      featured,
    })
    
    // Filter by pending store if requested
    if (pendingStore) {
      beats = beats.filter(beat => beat.isPendingStore)
    } else if (pendingStore === false) {
      beats = beats.filter(beat => !beat.isPendingStore)
    }
    
    return NextResponse.json(beats)
  } catch (error) {
    console.error("Error fetching beats:", error)
    return NextResponse.json({ message: "Failed to fetch beats" }, { status: 500 })
  }
}

