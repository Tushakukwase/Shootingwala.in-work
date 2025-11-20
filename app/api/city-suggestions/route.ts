import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    const suggestions = db.collection('city_suggestions')
    
    const allSuggestions = await suggestions.find({}).toArray()
    
    return NextResponse.json({
      success: true,
      suggestions: allSuggestions
    })
  } catch (error) {
    console.error('Error fetching city suggestions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch city suggestions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, suggestedBy } = await request.json()
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'City name is required' },
        { status: 400 }
      )
    }
    
    const client = await clientPromise
    const db = client.db('photobook')
    const suggestions = db.collection('city_suggestions')
    
    const newSuggestion = {
      name,
      suggestedBy: suggestedBy || 'Anonymous',
      status: 'pending',
      createdAt: new Date()
    }
    
    const result = await suggestions.insertOne(newSuggestion)
    
    return NextResponse.json({
      success: true,
      suggestion: { ...newSuggestion, _id: result.insertedId }
    })
  } catch (error) {
    console.error('Error creating city suggestion:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create city suggestion' },
      { status: 500 }
    )
  }
}