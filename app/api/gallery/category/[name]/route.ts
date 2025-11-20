import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const client = await clientPromise
    const db = client.db('shootingwala')
    const { name } = await params
    
    const decodedCategoryName = decodeURIComponent(name.replace(/-/g, ' '))
    
    const images = await db.collection('gallery_images')
      .find({ 
        category: { $regex: new RegExp(`^${decodedCategoryName}$`, 'i') }
      })
      .sort({ uploadedAt: -1 })
      .toArray()
    
    return NextResponse.json({ 
      success: true, 
      images: images.map(img => ({
        _id: img._id.toString(),
        category: img.category,
        imageUrl: img.imageUrl,
        uploaderName: img.uploaderName,
        uploadedAt: img.uploadedAt
      })),
      categoryName: images.length > 0 ? images[0].category : decodedCategoryName
    })
  } catch (error) {
    console.error('Error fetching category images:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch category images' }, { status: 500 })
  }
}