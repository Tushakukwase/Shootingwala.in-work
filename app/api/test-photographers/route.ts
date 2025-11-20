import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    const photographers = db.collection('photographers')
    
    // Get all photographers
    const allPhotographers = await photographers.find({}).toArray()
    
    // Get approved photographers
    const approvedPhotographers = await photographers.find({ isApproved: true }).toArray()
    
    // Get unapproved photographers
    const unapprovedPhotographers = await photographers.find({ isApproved: { $ne: true } }).toArray()
    
    return NextResponse.json({
      total: allPhotographers.length,
      approved: approvedPhotographers.length,
      unapproved: unapprovedPhotographers.length,
      allPhotographers: allPhotographers.map(p => ({
        _id: p._id.toString(),
        name: p.name,
        email: p.email,
        isApproved: p.isApproved,
        createdBy: p.createdBy,
        createdAt: p.createdAt
      })),
      approvedPhotographers: approvedPhotographers.map(p => ({
        _id: p._id.toString(),
        name: p.name,
        email: p.email,
        isApproved: p.isApproved,
        createdBy: p.createdBy,
        createdAt: p.createdAt
      }))
    })
  } catch (error) {
    console.error('Error in test endpoint:', error)
    return NextResponse.json({ error: 'Failed to fetch test data' }, { status: 500 })
  }
}