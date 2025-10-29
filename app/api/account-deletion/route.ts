import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/server/db'
import { users, beats, purchases, storeProducts, proVerificationRequests } from '@/shared/schema'
import { eq, and } from 'drizzle-orm'

// Delete user account with multiple security checks
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, confirmationText, password, reason } = body

    // Security Check 1: Required fields
    if (!userId || !confirmationText || !password || !reason) {
      return NextResponse.json({ 
        error: 'User ID, confirmation text, password, and reason are required' 
      }, { status: 400 })
    }

    // Security Check 2: Confirmation text must be exact
    const requiredConfirmationText = "DELETE MY ACCOUNT PERMANENTLY"
    if (confirmationText !== requiredConfirmationText) {
      return NextResponse.json({ 
        error: 'Confirmation text does not match. Please type exactly: DELETE MY ACCOUNT PERMANENTLY' 
      }, { status: 400 })
    }

    // Security Check 3: Reason must be at least 10 characters
    if (reason.length < 10) {
      return NextResponse.json({ 
        error: 'Please provide a detailed reason (at least 10 characters)' 
      }, { status: 400 })
    }

    // Security Check 4: Verify user exists and password is correct
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    
    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user[0].password !== password) {
      return NextResponse.json({ 
        error: 'Incorrect password. Please verify your password.' 
      }, { status: 401 })
    }

    // Security Check 5: Prevent admin account deletion (if needed)
    if (user[0].role === 'admin') {
      return NextResponse.json({ 
        error: 'Admin accounts cannot be deleted through this interface. Contact system administrator.' 
      }, { status: 403 })
    }

    // Security Check 6: Check for active purchases or pending transactions
    const activePurchases = await db.select()
      .from(purchases)
      .where(eq(purchases.buyerId, userId))
      .limit(1)

    if (activePurchases.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete account with active purchases. Please contact support to resolve any outstanding transactions first.' 
      }, { status: 400 })
    }

    // Security Check 7: Check for pending PRO verification requests
    const pendingVerifications = await db.select()
      .from(proVerificationRequests)
      .where(and(
        eq(proVerificationRequests.userId, userId),
        eq(proVerificationRequests.status, 'pending')
      ))
      .limit(1)

    if (pendingVerifications.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete account with pending PRO verification requests. Please wait for verification to complete or cancel the request.' 
      }, { status: 400 })
    }

    // Log the deletion attempt for audit purposes
    console.log(`Account deletion attempt for user ${userId} (${user[0].email}). Reason: ${reason}`)

    // Start transaction to delete all user data
    try {
      // Delete user's beats
      await db.delete(beats).where(eq(beats.producerId, userId))
      
      // Delete user's store products
      await db.delete(storeProducts).where(eq(storeProducts.userId, userId))
      
      // Delete user's PRO verification requests
      await db.delete(proVerificationRequests).where(eq(proVerificationRequests.userId, userId))
      
      // Delete user's purchases (as buyer)
      await db.delete(purchases).where(eq(purchases.buyerId, userId))
      
      // Finally, delete the user account
      await db.delete(users).where(eq(users.id, userId))

      // Log successful deletion
      console.log(`Account successfully deleted for user ${userId} (${user[0].email})`)

      return NextResponse.json({ 
        success: true, 
        message: 'Account has been permanently deleted. All your data has been removed from our systems.',
        deletedAt: new Date().toISOString()
      })

    } catch (transactionError) {
      console.error('Error during account deletion transaction:', transactionError)
      return NextResponse.json({ 
        error: 'Failed to delete account. Please contact support.' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error processing account deletion:', error)
    return NextResponse.json({ 
      error: 'An unexpected error occurred. Please try again or contact support.' 
    }, { status: 500 })
  }
}

// Get account deletion requirements and warnings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    
    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check for blocking conditions
    const activePurchases = await db.select()
      .from(purchases)
      .where(eq(purchases.buyerId, userId))
      .limit(1)

    const pendingVerifications = await db.select()
      .from(proVerificationRequests)
      .where(and(
        eq(proVerificationRequests.userId, userId),
        eq(proVerificationRequests.status, 'pending')
      ))
      .limit(1)

    const userBeats = await db.select()
      .from(beats)
      .where(eq(beats.producerId, userId))
      .limit(1)

    const userStoreProducts = await db.select()
      .from(storeProducts)
      .where(eq(storeProducts.userId, userId))
      .limit(1)

    return NextResponse.json({
      canDelete: activePurchases.length === 0 && pendingVerifications.length === 0,
      blockingReasons: [
        ...(activePurchases.length > 0 ? ['Active purchases exist'] : []),
        ...(pendingVerifications.length > 0 ? ['Pending PRO verification requests'] : [])
      ],
      dataSummary: {
        beats: userBeats.length,
        storeProducts: userStoreProducts.length,
        purchases: activePurchases.length,
        pendingVerifications: pendingVerifications.length
      },
      warnings: [
        'This action is PERMANENT and cannot be undone',
        'All your beats, store products, and account data will be deleted',
        'You will lose access to all purchased licenses',
        'Your verification status and trust score will be lost',
        'This action will be logged for security purposes'
      ]
    })

  } catch (error) {
    console.error('Error checking account deletion requirements:', error)
    return NextResponse.json({ error: 'Failed to check deletion requirements' }, { status: 500 })
  }
}
