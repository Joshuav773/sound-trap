import { NextResponse } from 'next/server'
import { DatabaseStorage } from '@/server/dbStorage'

const storage = new DatabaseStorage()

export async function GET() {
  try {
    const beats = await storage.getFeaturedBeats()
    return NextResponse.json(beats)
  } catch (error) {
    console.error("Error fetching featured beats:", error)
    return NextResponse.json({ message: "Failed to fetch featured beats" }, { status: 500 })
  }
}

