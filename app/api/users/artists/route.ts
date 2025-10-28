import { NextResponse } from 'next/server'
import { DatabaseStorage } from '@/server/dbStorage'

const storage = new DatabaseStorage()

export async function GET() {
  try {
    const artists = await storage.getAllArtists()
    return NextResponse.json(artists)
  } catch (error) {
    console.error("Error fetching artists:", error)
    return NextResponse.json({ message: "Failed to fetch artists" }, { status: 500 })
  }
}

