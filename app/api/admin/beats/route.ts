import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { insertBeatSchema } from '@shared/schema'
import { DatabaseStorage } from '@/server/dbStorage'

const storage = new DatabaseStorage()
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('beatFile') as File
    
    if (!file) {
      return NextResponse.json({ message: "No audio file provided" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const filename = `${Date.now()}-${file.name}`
    const filePath = join(uploadsDir, filename)

    await writeFile(filePath, buffer)

    const beatData = {
      title: formData.get('title') as string,
      producer: formData.get('producer') as string,
      fileName: file.name,
      filePath: `/uploads/${filename}`,
      duration: parseInt(formData.get('duration') as string) || 120,
      bpm: parseInt(formData.get('bpm') as string),
      key: formData.get('key') as string,
      tags: formData.get('tags') ? (formData.get('tags') as string).split(',').map((tag: string) => tag.trim()) : [],
      leasePrice: formData.get('leasePrice') as string,
      exclusivePrice: formData.get('exclusivePrice') as string,
      isFeatured: formData.get('isFeatured') === 'true',
      isPendingStore: formData.get('isPendingStore') === 'true',
    }

    const validatedData = insertBeatSchema.parse(beatData)
    const beat = await storage.createBeat(validatedData)
    
    return NextResponse.json(beat, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        message: "Invalid beat data", 
        errors: error.errors 
      }, { status: 400 })
    }
    console.error("Error creating beat:", error)
    return NextResponse.json({ message: "Failed to create beat" }, { status: 500 })
  }
}

