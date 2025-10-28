import { NextRequest, NextResponse } from 'next/server'
import { db } from '@server/db'
import { trialDownloads } from '@shared/schema'
import { eq } from 'drizzle-orm'

// Track trial download
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { beatId, customerEmail, customerName, ipAddress } = body

    if (!beatId) {
      return NextResponse.json({ error: 'Beat ID is required' }, { status: 400 })
    }

    const newDownload = await db.insert(trialDownloads).values({
      beatId,
      customerEmail: customerEmail || null,
      customerName: customerName || null,
      ipAddress: ipAddress || null,
    }).returning()

    // Trigger Zapier webhook for trial download
    if (customerEmail) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/zapier`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-zapier-signature': 'webhook-signature'
          },
          body: JSON.stringify({
            event: 'trial_downloaded',
            data: {
              customerEmail,
              customerName: customerName || null,
              beatId,
              beatTitle: data.beatTitle, // Would need to fetch from beats table
              producerName: data.producerName, // Would need to fetch from beats table
              downloadUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/downloads/${beatId}/demo`,
              downloadedAt: new Date().toISOString()
            }
          })
        })
      } catch (error) {
        console.error('Failed to trigger trial download webhook:', error)
      }
    }

    return NextResponse.json(newDownload[0])
  } catch (error) {
    console.error('Error tracking trial download:', error)
    return NextResponse.json({ error: 'Failed to track trial download' }, { status: 500 })
  }
}

// Get trial download stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const beatId = searchParams.get('beatId')

    if (!beatId) {
      return NextResponse.json({ error: 'Beat ID is required' }, { status: 400 })
    }

    const downloads = await db.select().from(trialDownloads)
      .where(eq(trialDownloads.beatId, parseInt(beatId)))

    // Calculate conversion rate
    const totalDownloads = downloads.length
    const converted = downloads.filter(d => d.convertedToPurchase).length
    const conversionRate = totalDownloads > 0 ? (converted / totalDownloads) * 100 : 0

    return NextResponse.json({
      totalDownloads,
      converted,
      conversionRate: conversionRate.toFixed(2)
    })
  } catch (error) {
    console.error('Error fetching trial download stats:', error)
    return NextResponse.json({ error: 'Failed to fetch download stats' }, { status: 500 })
  }
}

// Mark as converted to purchase
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { beatId, customerEmail } = body

    if (!beatId || !customerEmail) {
      return NextResponse.json({ error: 'Beat ID and customer email are required' }, { status: 400 })
    }

    // Find and update the most recent download for this beat and customer
    const downloads = await db.select().from(trialDownloads)
      .where(eq(trialDownloads.beatId, parseInt(beatId)))

    const download = downloads
      .filter(d => d.customerEmail === customerEmail)
      .sort((a, b) => b.downloadedAt.getTime() - a.downloadedAt.getTime())[0]

    if (!download) {
      return NextResponse.json({ error: 'Download record not found' }, { status: 404 })
    }

    const updated = await db.update(trialDownloads)
      .set({ convertedToPurchase: true })
      .where(eq(trialDownloads.id, download.id))
      .returning()

    return NextResponse.json(updated[0])
  } catch (error) {
    console.error('Error marking as converted:', error)
    return NextResponse.json({ error: 'Failed to update conversion status' }, { status: 500 })
  }
}
