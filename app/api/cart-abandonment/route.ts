import { NextRequest, NextResponse } from 'next/server'
import { db } from '@server/db'
import { abandonedCarts } from '@shared/schema'
import { eq } from 'drizzle-orm'

// Track abandoned cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, customerEmail, customerName, cartItems, totalAmount } = body

    if (!sessionId || !cartItems || !totalAmount) {
      return NextResponse.json({ error: 'Session ID, cart items, and total amount are required' }, { status: 400 })
    }

    const newAbandonedCart = await db.insert(abandonedCarts).values({
      sessionId,
      customerEmail: customerEmail || null,
      customerName: customerName || null,
      cartItems: JSON.stringify(cartItems),
      totalAmount,
    }).returning()

    // Trigger Zapier webhook for cart abandonment
    if (customerEmail) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/zapier`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-zapier-signature': 'webhook-signature' // In production, use real signature
          },
          body: JSON.stringify({
            event: 'cart_abandoned',
            data: {
              customerEmail,
              customerName: customerName || null,
              cartItems,
              totalAmount,
              abandonedAt: new Date().toISOString(),
              sessionId
            }
          })
        })
      } catch (error) {
        console.error('Failed to trigger cart abandonment webhook:', error)
      }
    }

    return NextResponse.json(newAbandonedCart[0])
  } catch (error) {
    console.error('Error tracking abandoned cart:', error)
    return NextResponse.json({ error: 'Failed to track abandoned cart' }, { status: 500 })
  }
}

// Get abandoned carts (for admin/producer dashboard)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const isRecovered = searchParams.get('isRecovered')

    let query = db.select().from(abandonedCarts)

    if (sessionId) {
      query = query.where(eq(abandonedCarts.sessionId, sessionId))
    }

    if (isRecovered !== null) {
      query = query.where(eq(abandonedCarts.isRecovered, isRecovered === 'true'))
    }

    const carts = await query
    return NextResponse.json(carts)
  } catch (error) {
    console.error('Error fetching abandoned carts:', error)
    return NextResponse.json({ error: 'Failed to fetch abandoned carts' }, { status: 500 })
  }
}

// Mark cart as recovered
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Cart ID is required' }, { status: 400 })
    }

    const updatedCart = await db.update(abandonedCarts)
      .set({
        isRecovered: true,
        recoveredAt: new Date()
      })
      .where(eq(abandonedCarts.id, id))
      .returning()

    return NextResponse.json(updatedCart[0])
  } catch (error) {
    console.error('Error marking cart as recovered:', error)
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
  }
}
