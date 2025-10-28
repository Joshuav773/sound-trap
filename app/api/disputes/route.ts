import { NextRequest, NextResponse } from 'next/server'
import { db } from '@server/db'
import { disputes, escrowTransactions, purchases } from '@shared/schema'
import { eq, and } from 'drizzle-orm'

// Create a new dispute
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { purchaseId, complainantId, respondentId, disputeType, description, evidence } = body

    if (!purchaseId || !complainantId || !respondentId || !disputeType || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate dispute types
    const validTypes = ['copyright', 'quality', 'delivery', 'refund']
    if (!validTypes.includes(disputeType)) {
      return NextResponse.json({ error: 'Invalid dispute type' }, { status: 400 })
    }

    const newDispute = await db.insert(disputes).values({
      purchaseId,
      complainantId,
      respondentId,
      disputeType,
      description,
      evidence: evidence ? JSON.stringify(evidence) : null,
    }).returning()

    // Trigger Zapier webhook for dispute notification
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/zapier`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-zapier-signature': 'webhook-signature'
        },
        body: JSON.stringify({
          event: 'dispute_created',
          data: {
            disputeId: newDispute[0].id,
            disputeType,
            complainantId,
            respondentId,
            description,
            createdAt: new Date().toISOString()
          }
        })
      })
    } catch (error) {
      console.error('Failed to trigger dispute webhook:', error)
    }

    return NextResponse.json(newDispute[0])
  } catch (error) {
    console.error('Error creating dispute:', error)
    return NextResponse.json({ error: 'Failed to create dispute' }, { status: 500 })
  }
}

// Get disputes (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const disputeType = searchParams.get('type')

    let query = db.select().from(disputes)

    if (status) {
      query = query.where(eq(disputes.status, status))
    }

    if (disputeType) {
      query = query.where(eq(disputes.disputeType, disputeType))
    }

    const disputeList = await query
    return NextResponse.json(disputeList)
  } catch (error) {
    console.error('Error fetching disputes:', error)
    return NextResponse.json({ error: 'Failed to fetch disputes' }, { status: 500 })
  }
}

// Resolve dispute (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { disputeId, resolution, resolvedBy } = body

    if (!disputeId || !resolution || !resolvedBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const updatedDispute = await db.update(disputes)
      .set({
        status: 'resolved',
        resolution,
        resolvedBy,
        resolvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(disputes.id, disputeId))
      .returning()

    return NextResponse.json(updatedDispute[0])
  } catch (error) {
    console.error('Error resolving dispute:', error)
    return NextResponse.json({ error: 'Failed to resolve dispute' }, { status: 500 })
  }
}
