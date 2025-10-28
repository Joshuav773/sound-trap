import { NextRequest, NextResponse } from 'next/server'
import { insertPurchaseSchema } from '@shared/schema'
import { DatabaseStorage } from '@/server/dbStorage'

const storage = new DatabaseStorage()
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const purchaseData = insertPurchaseSchema.parse(body)
    
    // Verify beat exists
    const beat = await storage.getBeat(purchaseData.beatId)
    if (!beat) {
      return NextResponse.json({ message: "Beat not found" }, { status: 404 })
    }

    // Mock payment processing - in real app would integrate with Stripe/PayPal
    const purchase = await storage.createPurchase(purchaseData)
    
    // Return success with download link
    return NextResponse.json({
      ...purchase,
      downloadLink: `/api/downloads/${beat.id}`, // Mock download endpoint
      message: "Purchase successful! Check your email for download instructions."
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        message: "Invalid purchase data", 
        errors: error.errors 
      }, { status: 400 })
    }
    console.error("Error processing purchase:", error)
    return NextResponse.json({ message: "Failed to process purchase" }, { status: 500 })
  }
}

