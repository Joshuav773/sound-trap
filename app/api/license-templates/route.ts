import { NextRequest, NextResponse } from 'next/server'
import { db } from '@server/db'
import { users, licenseTemplates } from '@shared/schema'
import { eq } from 'drizzle-orm'

// Get all license templates
export async function GET() {
  try {
    const templates = await db.select().from(licenseTemplates)
    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching license templates:', error)
    return NextResponse.json({ error: 'Failed to fetch license templates' }, { status: 500 })
  }
}

// Create a new license template (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // In production, verify admin authentication here
    const { name, type, description, streamLimit, musicVideos, radioAirplay, commercialUse, syncRights, plainLanguageSummary, legalContract, price, includesMp3, includesWav, includesStems, includesTrackout } = body

    const newTemplate = await db.insert(licenseTemplates).values({
      name,
      type,
      description,
      streamLimit: streamLimit || null,
      musicVideos: musicVideos || 1,
      radioAirplay: radioAirplay || false,
      commercialUse: commercialUse || false,
      syncRights: syncRights || false,
      plainLanguageSummary,
      legalContract,
      price,
      includesMp3: includesMp3 !== false,
      includesWav: includesWav || false,
      includesStems: includesStems || false,
      includesTrackout: includesTrackout || false,
    }).returning()

    return NextResponse.json(newTemplate[0])
  } catch (error) {
    console.error('Error creating license template:', error)
    return NextResponse.json({ error: 'Failed to create license template' }, { status: 500 })
  }
}
