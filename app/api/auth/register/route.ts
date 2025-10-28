import { NextRequest, NextResponse } from 'next/server'
import { DatabaseStorage } from '@/server/dbStorage'

const storage = new DatabaseStorage()
import { insertUserSchema } from '@shared/schema'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = insertUserSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(validatedData.email)
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    const user = await storage.createUser(validatedData)

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        message: "Invalid data", 
        errors: error.errors 
      }, { status: 400 })
    }
    console.error("Error registering user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

