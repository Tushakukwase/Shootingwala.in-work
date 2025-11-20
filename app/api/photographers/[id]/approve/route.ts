import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    const { id } = await params

    // First check if photographer exists
    const photographer = await db.collection('photographers').findOne({ _id: new ObjectId(id) });
    if (!photographer) {
      return NextResponse.json({ success: false, error: 'Photographer not found' }, { status: 404 })
    }

    const result = await db.collection('photographers').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isApproved: true,
          status: 'approved',
          approvedAt: new Date(),
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Failed to update photographer' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Photographer approved successfully',
      photographer: {
        ...photographer,
        isApproved: true,
        status: 'approved'
      }
    })
  } catch (error) {
    console.error('Error approving photographer:', error)
    return NextResponse.json({ success: false, error: 'Failed to approve photographer' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const client = await clientPromise
    const db = client.db('photobook')
    const { id } = await params

    const result = await db.collection('photographers').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isApproved: false,
          status: 'rejected',
          rejectedAt: new Date(),
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Photographer not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Photographer registration rejected'
    })
  } catch (error) {
    console.error('Error rejecting photographer:', error)
    return NextResponse.json({ success: false, error: 'Failed to reject photographer' }, { status: 500 })
  }
}