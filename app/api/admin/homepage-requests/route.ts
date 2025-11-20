import { NextRequest, NextResponse } from 'next/server';
import { MockStorage } from '@/lib/mock-storage';

export async function GET(req: NextRequest) {
  try {
    const notifications = MockStorage.getNotifications()
    
    // Filter homepage requests that need approval
    const homepageRequests = notifications.filter((notification: any) => 
      notification.actionRequired && 
      (notification.type === 'gallery_homepage_request' || notification.type === 'story_homepage_request')
    )
    
    return NextResponse.json({ 
      success: true,
      requests: homepageRequests
    });
    
  } catch (error) {
    console.error('Error fetching homepage requests:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch homepage requests' 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { notificationId, action, type, relatedId } = await req.json();
    
    if (!notificationId || !action || !type || !relatedId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }
    
    // Update the notification
    const notifications = MockStorage.getNotifications()
    const notificationIndex = notifications.findIndex((n: any) => n.id === notificationId)
    
    if (notificationIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        error: 'Notification not found' 
      }, { status: 404 });
    }
    
    const notification = notifications[notificationIndex]
    
    if (action === 'approve') {
      // Update the gallery or story to show on homepage
      if (type === 'gallery_homepage_request') {
        const galleries = MockStorage.getGalleries()
        const galleryIndex = galleries.findIndex((g: any) => g._id === relatedId)
        
        if (galleryIndex !== -1) {
          galleries[galleryIndex].showOnHome = true
          galleries[galleryIndex].status = 'approved'
          galleries[galleryIndex].approved_by = 'admin'
          galleries[galleryIndex].approved_by_name = 'Admin'
          galleries[galleryIndex].approved_at = new Date().toISOString()
          MockStorage.saveGalleries(galleries)
        }
      } else if (type === 'story_homepage_request') {
        const stories = MockStorage.getStories()
        const storyIndex = stories.findIndex((s: any) => s._id === relatedId)
        
        if (storyIndex !== -1) {
          stories[storyIndex].showOnHome = true
          stories[storyIndex].status = 'approved'
          stories[storyIndex].approved_by = 'admin'
          stories[storyIndex].approved_by_name = 'Admin'
          stories[storyIndex].approved_at = new Date().toISOString()
          MockStorage.saveStories(stories)
        }
      }
      
      // Update notification
      notification.actionRequired = false
      notification.message = notification.message + ' - APPROVED by Admin'
      notification.timestamp = 'Just now'
      
      // Create notification for photographer
      const photographerId = notification.userId
      if (photographerId) {
        const newNotification = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          type: type === 'gallery_homepage_request' ? 'gallery_approved' : 'story_approved',
          title: type === 'gallery_homepage_request' ? 'Gallery Approved for Homepage!' : 'Story Approved for Homepage!',
          message: type === 'gallery_homepage_request' 
            ? 'Your gallery has been approved and will be featured on the homepage.' 
            : 'Your story has been approved and will be featured on the homepage.',
          userId: photographerId,
          relatedId: relatedId,
          actionRequired: false,
          read: false,
          createdAt: new Date().toISOString(),
          timestamp: 'Just now'
        }
        
        notifications.push(newNotification)
      }
      
    } else if (action === 'reject') {
      // Update content status to rejected
      if (type === 'gallery_homepage_request') {
        const galleries = MockStorage.getGalleries()
        const galleryIndex = galleries.findIndex((g: any) => g._id === relatedId)
        
        if (galleryIndex !== -1) {
          galleries[galleryIndex].status = 'rejected'
          galleries[galleryIndex].approved_by = 'admin'
          galleries[galleryIndex].approved_by_name = 'Admin'
          galleries[galleryIndex].approved_at = new Date().toISOString()
          MockStorage.saveGalleries(galleries)
        }
      } else if (type === 'story_homepage_request') {
        const stories = MockStorage.getStories()
        const storyIndex = stories.findIndex((s: any) => s._id === relatedId)
        
        if (storyIndex !== -1) {
          stories[storyIndex].status = 'rejected'
          stories[storyIndex].approved_by = 'admin'
          stories[storyIndex].approved_by_name = 'Admin'
          stories[storyIndex].approved_at = new Date().toISOString()
          MockStorage.saveStories(stories)
        }
      }
      
      // Update notification
      notification.actionRequired = false
      notification.message = notification.message + ' - REJECTED by Admin'
      notification.timestamp = 'Just now'
      
      // Create notification for photographer
      const photographerId = notification.userId
      if (photographerId) {
        const newNotification = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          type: type === 'gallery_homepage_request' ? 'gallery_rejected' : 'story_rejected',
          title: type === 'gallery_homepage_request' ? 'Gallery Request Rejected' : 'Story Request Rejected',
          message: type === 'gallery_homepage_request' 
            ? 'Your gallery request for homepage has been rejected. Please review and resubmit.' 
            : 'Your story request for homepage has been rejected. Please review and resubmit.',
          userId: photographerId,
          relatedId: relatedId,
          actionRequired: false,
          read: false,
          createdAt: new Date().toISOString(),
          timestamp: 'Just now'
        }
        
        notifications.push(newNotification)
      }
    }
    
    MockStorage.saveNotifications(notifications)
    
    return NextResponse.json({ 
      success: true,
      message: `Request ${action}d successfully`
    });
    
  } catch (error) {
    console.error('Error processing homepage request:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process request' 
    }, { status: 500 });
  }
}