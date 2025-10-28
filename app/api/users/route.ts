import { NextRequest, NextResponse } from 'next/server'
import { DatabaseStorage } from '@/server/dbStorage'

const storage = new DatabaseStorage()

export async function GET() {
  try {
    const users = await storage.getAllUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id') || '0')
    
    if (!id) {
      return NextResponse.json({ message: "User ID required" }, { status: 400 })
    }

    const deleted = await storage.deleteUser(id)
    
    if (!deleted) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ message: "Failed to delete user" }, { status: 500 })
  }
}

