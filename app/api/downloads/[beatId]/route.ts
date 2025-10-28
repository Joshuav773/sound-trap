import { NextRequest, NextResponse } from 'next/server'
import { DatabaseStorage } from '@/server/dbStorage'

const storage = new DatabaseStorage()

export async function GET(
  request: NextRequest,
  { params }: { params: { beatId: string } }
) {
  try {
    const beatId = parseInt(params.beatId)
    const beat = await storage.getBeat(beatId)
    
    if (!beat) {
      return NextResponse.json({ message: "Beat not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Download link generated",
      downloadUrl: beat.filePath,
      usageRules: "/api/usage-rules.pdf",
      splits: "/api/splits-info.pdf"
    })
  } catch (error) {
    console.error("Error generating download:", error)
    return NextResponse.json({ message: "Failed to generate download" }, { status: 500 })
  }
}

