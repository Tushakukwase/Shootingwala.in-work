import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const { galleryId, photographerId, photographerName } = await req.json();
    
    if (!galleryId || !photographerId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Gallery ID and photographer ID are required' 
      }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('photobook');
    const galleries = db.collection('photographer_galleries');
    const notifications = db.collection('notifications');
    
    // Find the gallery
    const gallery = await galleries.findOne({ _id: new ObjectId(galleryId) });
    
    if (!gallery) {
      return NextResponse.json({ 
        success: false, 
        error: 'Gallery not found' 
      }, { status: 404 });
    }
    
    // Update gallery status to pending
    await galleries.updateOne(
      { _id: new ObjectId(galleryId) },
      { 
        $set: { 
          status: 'pending',
          request_date: new Date(),
          is_notified: true,
          updatedAt: new Date()
        } 
      }
    );
    
    // Create notification for admin
    const newNotification = {
      type: 'gallery_homepage_request',
      title: 'Gallery Homepage Request',
      message: `${photographerName} requested to display gallery "${gallery.name}" on homepage`,
      userId: 'admin',
      relatedId: galleryId,
      actionRequired: true,
      read: false,
      createdAt: new Date(),
      photographerId,
      photographerName,
      contentType: 'gallery',
      contentTitle: gallery.name
    };
    
    await notifications.insertOne(newNotification);
    
    return NextResponse.json({ 
      success: true,
      message: 'Homepage request sent successfully'
    });
    
  } catch (error) {
    console.error('Error creating homepage request:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send homepage request' 
    }, { status: 500 });
  }
}