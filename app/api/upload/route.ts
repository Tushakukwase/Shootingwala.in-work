import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'category' or 'city'
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }
    
    // In a real application, you would save the file to a storage service
    // For now, we'll convert to base64 and return it
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const mimeType = file.type
    const dataUrl = `data:${mimeType};base64,${base64}`
    
    // In production, you would:
    // 1. Save file to disk or cloud storage (AWS S3, Cloudinary, etc.)
    // 2. Return the public URL
    // For demo purposes, we'll return the data URL
    
    return NextResponse.json({
      success: true,
      data: {
        url: dataUrl,
        filename: file.name,
        size: file.size,
        type: file.type
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload file' 
    }, { status: 500 })
  }
}