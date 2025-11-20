import { NextRequest, NextResponse } from 'next/server'

// Mock database - in production, use a real database
let portfolioItems: any[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const photographerId = searchParams.get('photographerId')
    const approved = searchParams.get('approved')
    
    let filteredItems = portfolioItems
    
    if (photographerId) {
      filteredItems = filteredItems.filter(item => item.photographerId === photographerId)
    }
    
    if (approved !== null) {
      filteredItems = filteredItems.filter(item => item.approved === (approved === 'true'))
    }
    
    return NextResponse.json({ success: true, data: filteredItems })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch portfolio items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, category, image, photographerId } = body
    
    const newItem = {
      id: Date.now().toString(),
      title,
      description,
      category,
      image,
      photographerId,
      approved: false,
      createdAt: new Date().toISOString(),
      views: 0,
      likes: 0
    }
    
    portfolioItems.push(newItem)
    
    return NextResponse.json({ success: true, data: newItem })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create portfolio item' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    const itemIndex = portfolioItems.findIndex(item => item.id === id)
    if (itemIndex === -1) {
      return NextResponse.json({ success: false, error: 'Portfolio item not found' }, { status: 404 })
    }
    
    portfolioItems[itemIndex] = { ...portfolioItems[itemIndex], ...updates }
    
    return NextResponse.json({ success: true, data: portfolioItems[itemIndex] })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update portfolio item' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Portfolio item ID is required' }, { status: 400 })
    }
    
    const itemIndex = portfolioItems.findIndex(item => item.id === id)
    if (itemIndex === -1) {
      return NextResponse.json({ success: false, error: 'Portfolio item not found' }, { status: 404 })
    }
    
    portfolioItems.splice(itemIndex, 1)
    
    return NextResponse.json({ success: true, message: 'Portfolio item deleted successfully' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete portfolio item' }, { status: 500 })
  }
}