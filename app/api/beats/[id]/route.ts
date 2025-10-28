import { NextRequest, NextResponse } from 'next/server'
import { DatabaseStorage } from '@/server/dbStorage'

const storage = new DatabaseStorage()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const beat = await storage.getBeat(id)
    
    if (!beat) {
      return NextResponse.json({ message: "Beat not found" }, { status: 404 })
    }
    
    return NextResponse.json(beat)
  } catch (error) {
    console.error("Error fetching beat:", error)
    return NextResponse.json({ message: "Failed to fetch beat" }, { status: 500 })
  }
}

