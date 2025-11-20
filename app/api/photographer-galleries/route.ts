import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const photographerId = searchParams.get('photographerId')
    
    const client = await clientPromise;
    const db = client.db('photobook');
    const galleries = db.collection('photographer_galleries');
    
    let query: any = {}
    
    // Filter by photographer if specified
    if (photographerId) {
      query.photographerId = photographerId
    }
    
    const allGalleries = await galleries.find(query).sort({ createdAt: -1 }).toArray();
    
    // Transform to match component interface
    const transformedGalleries = allGalleries.map((gallery: any) => ({
      id: gallery._id.toString(),
      name: gallery.name,
      description: gallery.description || '',
      images: gallery.images,
      photographerId: gallery.photographerId || 'unknown',
      photographerName: gallery.photographerName || 'Photographer',
      status: gallery.status || 'draft',
      showOnHome: gallery.showOnHome || false,
      createdAt: gallery.createdAt,
      approvedAt: gallery.approvedAt
    }))
    
    return NextResponse.json({ 
      success: true,
      galleries: transformedGalleries
    });
  } catch (error) {
    console.error('Error fetching photographer galleries:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch galleries' 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, images, photographerId, photographerName, description } = await req.json();
    
    if (!name || !images || !photographerId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name, images, and photographer ID are required' 
      }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('photobook');
    const galleries = db.collection('photographer_galleries');
    
    const isAdmin = photographerId === 'admin'
    
    const newGallery = {
      name,
      description: description || `Gallery by ${photographerName}`,
      images: images,
      photographerId: isAdmin ? null : photographerId,
      photographerName: isAdmin ? null : photographerName,
      content_type: 'gallery',
      created_by: isAdmin ? 'admin' : 'photographer',
      created_by_name: isAdmin ? 'Admin' : photographerName,
      approved_by: isAdmin ? 'admin' : null,
      approved_by_name: isAdmin ? 'Admin' : null,
      status: isAdmin ? 'approved' : 'draft', // Photographer galleries start as draft
      showOnHome: false, // Never show on homepage without explicit approval
      request_date: null,
      approved_at: isAdmin ? new Date() : null,
      is_notified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await galleries.insertOne(newGallery);
    
    return NextResponse.json({ 
      success: true,
      gallery: {
        id: result.insertedId.toString(),
        name: newGallery.name,
        description: newGallery.description,
        images: newGallery.images,
        photographerId: newGallery.photographerId,
        status: newGallery.status,
        showOnHome: newGallery.showOnHome,
        createdAt: newGallery.createdAt
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating photographer gallery:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create gallery' 
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, name, description, images, status, showOnHome, approved_by, approved_by_name } = await req.json();
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Gallery ID is required' 
      }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('photobook');
    const galleries = db.collection('photographer_galleries');
    
    const updateData: any = {
      updatedAt: new Date()
    };
    
    // Update fields
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (images) updateData.images = images;
    
    if (status) {
      updateData.status = status;
      // Only set showOnHome to false when rejecting, don't auto-set to true when approving
      if (status === 'rejected') {
        updateData.showOnHome = false;
      }
      if (status === 'approved') {
        updateData.approved_at = new Date();
      }
    }
    
    // Only allow showOnHome to be true if status is approved
    if (showOnHome !== undefined) {
      const gallery = await galleries.findOne({ _id: new ObjectId(id) });
      if (gallery && (gallery.status === 'approved' || status === 'approved')) {
        updateData.showOnHome = showOnHome;
      } else if (!showOnHome) {
        // Always allow setting to false
        updateData.showOnHome = false;
      }
    }
    
    if (approved_by) {
      updateData.approved_by = approved_by;
      updateData.approved_by_name = approved_by_name;
    }
    
    const result = await galleries.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Gallery not found' 
      }, { status: 404 });
    }
    
    const updatedGallery = await galleries.findOne({ _id: new ObjectId(id) });
    
    if (!updatedGallery) {
      return NextResponse.json({ 
        success: false, 
        error: 'Gallery not found after update' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true,
      gallery: {
        id: updatedGallery._id.toString(),
        name: updatedGallery.name,
        description: updatedGallery.description,
        images: updatedGallery.images,
        photographerId: updatedGallery.photographerId,
        photographerName: updatedGallery.photographerName,
        status: updatedGallery.status,
        showOnHome: updatedGallery.showOnHome,
        createdAt: updatedGallery.createdAt,
        approvedAt: updatedGallery.approved_at
      }
    });
    
  } catch (error) {
    console.error('Error updating photographer gallery:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update gallery' 
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Gallery ID is required' 
      }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('photobook');
    const galleries = db.collection('photographer_galleries');
    
    const result = await galleries.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Gallery not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Gallery deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting photographer gallery:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete gallery' 
    }, { status: 500 });
  }
}