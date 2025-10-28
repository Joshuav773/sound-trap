import { NextRequest, NextResponse } from 'next/server'
import { DatabaseStorage } from '@/server/dbStorage'

const storage = new DatabaseStorage()

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    const user = await storage.getUserByEmail(email)

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    if (user.password !== password) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // In production, use JWT tokens
    const token = `token_${user.id}_${Date.now()}`

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    })
  } catch (error) {
    console.error("Error logging in:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

