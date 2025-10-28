import { NextRequest, NextResponse } from 'next/server'
import { db } from '@server/db'
import { escrowTransactions, purchases } from '@shared/schema'
import { eq, and } from 'drizzle-orm'

// Create escrow transaction for high-value purchases
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { purchaseId, buyerId, sellerId, amount, releaseConditions } = body

    if (!purchaseId || !buyerId || !sellerId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Only create escrow for purchases over $100
    if (parseFloat(amount) < 100) {
      return NextResponse.json({ error: 'Escrow only available for purchases over $100' }, { status: 400 })
    }

    const newEscrow = await db.insert(escrowTransactions).values({
      purchaseId,
      buyerId,
      sellerId,
      amount,
      releaseConditions: releaseConditions ? JSON.stringify(releaseConditions) : JSON.stringify({
        autoReleaseAfterDays: 7,
        requiresDeliveryConfirmation: true,
        allowsRefund: true
      }),
      status: 'pending',
      heldAt: new Date()
    }).returning()

    return NextResponse.json(newEscrow[0])
  } catch (error) {
    console.error('Error creating escrow transaction:', error)
    return NextResponse.json({ error: 'Failed to create escrow transaction' }, { status: 500 })
  }
}

// Get escrow transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    let query = db.select().from(escrowTransactions)

    if (userId) {
      query = query.where(
        and(
          eq(escrowTransactions.buyerId, parseInt(userId)),
          eq(escrowTransactions.sellerId, parseInt(userId))
        )
      )
    }

    if (status) {
      query = query.where(eq(escrowTransactions.status, status))
    }

    const escrowList = await query
    return NextResponse.json(escrowList)
  } catch (error) {
    console.error('Error fetching escrow transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch escrow transactions' }, { status: 500 })
  }
}

// Release escrow funds
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { escrowId, action, adminId } = body // action: 'release' or 'refund'

    if (!escrowId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const validActions = ['release', 'refund']
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updateData: any = {
      status: action === 'release' ? 'released' : 'refunded',
      updatedAt: new Date()
    }

    if (action === 'release') {
      updateData.releasedAt = new Date()
    } else {
      updateData.refundedAt = new Date()
    }

    const updatedEscrow = await db.update(escrowTransactions)
      .set(updateData)
      .where(eq(escrowTransactions.id, escrowId))
      .returning()

    // Trigger webhook for escrow resolution
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/zapier`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-zapier-signature': 'webhook-signature'
        },
        body: JSON.stringify({
          event: 'escrow_resolved',
          data: {
            escrowId,
            action,
            amount: updatedEscrow[0].amount,
            buyerId: updatedEscrow[0].buyerId,
            sellerId: updatedEscrow[0].sellerId,
            resolvedAt: new Date().toISOString()
          }
        })
      })
    } catch (error) {
      console.error('Failed to trigger escrow webhook:', error)
    }

    return NextResponse.json(updatedEscrow[0])
  } catch (error) {
    console.error('Error updating escrow transaction:', error)
    return NextResponse.json({ error: 'Failed to update escrow transaction' }, { status: 500 })
  }
}
