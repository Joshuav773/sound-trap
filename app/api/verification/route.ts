import { NextRequest, NextResponse } from 'next/server'
import { db } from '@server/db'
import { users } from '@shared/schema'
import { eq } from 'drizzle-orm'

// Get verification status for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const user = await db.select().from(users).where(eq(users.id, parseInt(userId))).limit(1)
    
    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { isVerified, verificationMethod, verificationDate, trustScore, verificationBadge } = user[0]
    
    return NextResponse.json({
      isVerified,
      verificationMethod,
      verificationDate,
      trustScore,
      verificationBadge
    })
  } catch (error) {
    console.error('Error fetching verification status:', error)
    return NextResponse.json({ error: 'Failed to fetch verification status' }, { status: 500 })
  }
}

// Verify ASCAP/BMI/SESAC membership
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, proType, memberNumber } = body

    if (!userId || !proType || !memberNumber) {
      return NextResponse.json({ error: 'User ID, PRO type, and member number are required' }, { status: 400 })
    }

    // NOTE: In production, you would call the PRO's API to verify membership
    // For now, we'll just store the member number and mark as verified
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    
    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let updateData: any = {
      isVerified: true,
      verificationMethod: proType.toLowerCase(),
      verificationDate: new Date(),
      trustScore: 50 // PRO membership gives a base trust score of 50
    }

    // Store the member number based on PRO type
    if (proType.toLowerCase() === 'ascap') {
      updateData.ascapMemberNumber = memberNumber
      updateData.verificationBadge = 'verified'
    } else if (proType.toLowerCase() === 'bmi') {
      updateData.bmiMemberNumber = memberNumber
      updateData.verificationBadge = 'verified'
    } else if (proType.toLowerCase() === 'sesac') {
      updateData.sesacMemberNumber = memberNumber
      updateData.verificationBadge = 'verified'
    }

    const updatedUser = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning()

    return NextResponse.json(updatedUser[0])
  } catch (error) {
    console.error('Error verifying PRO membership:', error)
    return NextResponse.json({ error: 'Failed to verify PRO membership' }, { status: 500 })
  }
}

// Update verification status (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, isVerified, verificationMethod, trustScore, verificationBadge } = body

    // In production, verify admin authentication here
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const updatedUser = await db.update(users)
      .set({
        isVerified: isVerified || false,
        verificationMethod: verificationMethod || null,
        verificationDate: isVerified ? new Date() : null,
        trustScore: trustScore || 0,
        verificationBadge: verificationBadge || 'unverified'
      })
      .where(eq(users.id, userId))
      .returning()

    if (!updatedUser.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(updatedUser[0])
  } catch (error) {
    console.error('Error updating verification status:', error)
    return NextResponse.json({ error: 'Failed to update verification status' }, { status: 500 })
  }
}

// Calculate trust score based on various factors
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Calculate trust score based on:
    // - Account age
    // - Number of beats uploaded
    // - Sales history
    // - Customer feedback
    // - Social media presence
    // - Identity verification
    
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    
    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = user[0]
    let trustScore = 0

    // Account age (0-20 points)
    const accountAgeDays = Math.floor((Date.now() - userData.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    if (accountAgeDays > 365) trustScore += 20
    else if (accountAgeDays > 180) trustScore += 15
    else if (accountAgeDays > 90) trustScore += 10
    else if (accountAgeDays > 30) trustScore += 5

    // Role-based bonus (0-10 points)
    if (userData.role === 'admin') trustScore += 10
    else if (userData.role === 'artist') trustScore += 5

    // Verification method bonus (0-30 points)
    if (userData.verificationMethod === 'identity') trustScore += 30
    else if (userData.verificationMethod === 'portfolio') trustScore += 20
    else if (userData.verificationMethod === 'references') trustScore += 10

    // Determine badge based on score
    let verificationBadge = 'unverified'
    if (trustScore >= 80) verificationBadge = 'elite'
    else if (trustScore >= 60) verificationBadge = 'premium'
    else if (trustScore >= 40) verificationBadge = 'verified'

    // Update user with new trust score
    const updatedUser = await db.update(users)
      .set({
        trustScore,
        verificationBadge,
        isVerified: trustScore >= 40
      })
      .where(eq(users.id, userId))
      .returning()

    return NextResponse.json({
      trustScore,
      verificationBadge,
      isVerified: trustScore >= 40,
      updatedUser: updatedUser[0]
    })
  } catch (error) {
    console.error('Error calculating trust score:', error)
    return NextResponse.json({ error: 'Failed to calculate trust score' }, { status: 500 })
  }
}
