import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/server/db'
import { proVerificationRequests, users } from '@/shared/schema'
import { eq, desc } from 'drizzle-orm'

// Get all PRO verification requests (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending', 'approved', 'rejected', or null for all

    let query = db.select({
      id: proVerificationRequests.id,
      userId: proVerificationRequests.userId,
      proType: proVerificationRequests.proType,
      memberNumber: proVerificationRequests.memberNumber,
      documentUrl: proVerificationRequests.documentUrl,
      documentType: proVerificationRequests.documentType,
      status: proVerificationRequests.status,
      adminNotes: proVerificationRequests.adminNotes,
      reviewedBy: proVerificationRequests.reviewedBy,
      reviewedAt: proVerificationRequests.reviewedAt,
      createdAt: proVerificationRequests.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(proVerificationRequests)
    .leftJoin(users, eq(proVerificationRequests.userId, users.id))
    .orderBy(desc(proVerificationRequests.createdAt))

    if (status) {
      query = query.where(eq(proVerificationRequests.status, status))
    }

    const requests = await query

    return NextResponse.json(requests)
  } catch (error) {
    console.error('Error fetching PRO verification requests:', error)
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}

// Submit a new PRO verification request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, proType, memberNumber, documentUrl, documentType } = body

    if (!userId || !proType || !memberNumber || !documentUrl || !documentType) {
      return NextResponse.json({ 
        error: 'User ID, PRO type, member number, document URL, and document type are required' 
      }, { status: 400 })
    }

    // Check if user already has a pending request for this PRO type
    const existingRequest = await db.select()
      .from(proVerificationRequests)
      .where(eq(proVerificationRequests.userId, userId))
      .where(eq(proVerificationRequests.proType, proType.toLowerCase()))
      .where(eq(proVerificationRequests.status, 'pending'))
      .limit(1)

    if (existingRequest.length > 0) {
      return NextResponse.json({ 
        error: 'You already have a pending verification request for this PRO organization' 
      }, { status: 400 })
    }

    const newRequest = await db.insert(proVerificationRequests)
      .values({
        userId,
        proType: proType.toLowerCase(),
        memberNumber,
        documentUrl,
        documentType,
        status: 'pending'
      })
      .returning()

    return NextResponse.json(newRequest[0])
  } catch (error) {
    console.error('Error creating PRO verification request:', error)
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
  }
}

// Update PRO verification request status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, status, adminNotes, reviewedBy } = body

    if (!requestId || !status) {
      return NextResponse.json({ 
        error: 'Request ID and status are required' 
      }, { status: 400 })
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ 
        error: 'Status must be either "approved" or "rejected"' 
      }, { status: 400 })
    }

    const updateData: any = {
      status,
      reviewedAt: new Date()
    }

    if (adminNotes) updateData.adminNotes = adminNotes
    if (reviewedBy) updateData.reviewedBy = reviewedBy

    const updatedRequest = await db.update(proVerificationRequests)
      .set(updateData)
      .where(eq(proVerificationRequests.id, requestId))
      .returning()

    if (!updatedRequest.length) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // If approved, update the user's PRO verification status
    if (status === 'approved') {
      const request = updatedRequest[0]
      const user = await db.select().from(users).where(eq(users.id, request.userId)).limit(1)
      
      if (user.length) {
        // Calculate trust score with PRO membership
        let trustScore = 50 // PRO membership gives a base trust score of 50
        
        // Add account age bonus
        const accountAgeDays = Math.floor((Date.now() - user[0].createdAt.getTime()) / (1000 * 60 * 60 * 24))
        if (accountAgeDays > 365) trustScore += 20
        else if (accountAgeDays > 180) trustScore += 15
        else if (accountAgeDays > 90) trustScore += 10
        else if (accountAgeDays > 30) trustScore += 5
        
        // Determine badge based on score
        let verificationBadge = 'unverified'
        if (trustScore >= 80) verificationBadge = 'elite'
        else if (trustScore >= 60) verificationBadge = 'premium'
        else if (trustScore >= 40) verificationBadge = 'verified'

        let userUpdateData: any = {
          isVerified: true,
          verificationMethod: request.proType,
          verificationDate: new Date(),
          trustScore,
          verificationBadge
        }

        // Store the member number based on PRO type
        if (request.proType === 'ascap') {
          userUpdateData.ascapMemberNumber = request.memberNumber
        } else if (request.proType === 'bmi') {
          userUpdateData.bmiMemberNumber = request.memberNumber
        } else if (request.proType === 'sesac') {
          userUpdateData.sesacMemberNumber = request.memberNumber
        }

        await db.update(users)
          .set(userUpdateData)
          .where(eq(users.id, request.userId))
      }
    }

    return NextResponse.json(updatedRequest[0])
  } catch (error) {
    console.error('Error updating PRO verification request:', error)
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
  }
}
