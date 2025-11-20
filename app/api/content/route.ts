import { NextRequest, NextResponse } from 'next/server';
import { MockStorage } from '@/lib/mock-storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const photographerId = searchParams.get('photographerId')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    
    // Get both galleries and stories
    const galleries = MockStorage.getGalleries()
    const stories = MockStorage.getStories()
    const likes = MockStorage.getLikes()
    const comments = MockStorage.getComments()
    
    // Transform galleries to unified format
    const galleryContent = galleries.map((gallery: any) => {
      // Get likes and comments count for this gallery
      const galleryLikes = likes.filter((like: any) => like.contentId === gallery._id).length
      const galleryComments = comments.filter((comment: any) => comment.contentId === gallery._id).length
      
      return {
        id: gallery._id,
        title: gallery.title,
        description: gallery.description || `Gallery by ${gallery.photographerName || 'Admin'}`,
        image_url: gallery.images && gallery.images.length > 0 ? gallery.images[0] : null,
        type: 'gallery',
        created_by: gallery.photographerId ? 'photographer' : 'admin',
        created_by_name: gallery.photographerName || 'Admin',
        created_by_id: gallery.photographerId || 'admin',
        status: gallery.status || 'approved',
        approved_by: gallery.approved_by || null,
        approved_by_id: gallery.approved_by || null,
        request_date: gallery.request_date || null,
        approved_at: gallery.approved_at || gallery.createdAt,
        is_notified: gallery.is_notified || false,
        showOnHome: gallery.showOnHome || false,
        createdAt: gallery.createdAt,
        images: gallery.images || [],
        photographerId: gallery.photographerId,
        likes: galleryLikes,
        comments: galleryComments
      }
    })
    
    // Transform stories to unified format
    const storyContent = stories.map((story: any) => {
      // Get likes and comments count for this story
      const storyLikes = likes.filter((like: any) => like.contentId === story._id).length
      const storyComments = comments.filter((comment: any) => comment.contentId === story._id).length
      
      return {
        id: story._id,
        title: story.title,
        description: story.content || story.description || '',
        image_url: story.coverImage || story.imageUrl || null,
        type: 'story',
        created_by: story.photographerId ? 'photographer' : 'admin',
        created_by_name: story.photographerName || story.photographer || 'Admin',
        created_by_id: story.photographerId || 'admin',
        status: story.status || 'approved',
        approved_by: story.approved_by || null,
        approved_by_id: story.approved_by || null,
        request_date: story.request_date || null,
        approved_at: story.approved_at || story.createdAt,
        is_notified: story.is_notified || false,
        showOnHome: story.showOnHome || false,
        createdAt: story.createdAt,
        content: story.content || '',
        location: story.location || '',
        date: story.date || '',
        photographerId: story.photographerId,
        likes: storyLikes,
        comments: storyComments
      }
    })
    
    // Combine all content
    let allContent = [...galleryContent, ...storyContent]
    
    // Apply filters
    if (photographerId) {
      allContent = allContent.filter(item => item.photographerId === photographerId)
    }
    
    if (status) {
      allContent = allContent.filter(item => item.status === status)
    }
    
    if (type) {
      allContent = allContent.filter(item => item.type === type)
    }
    
    // Sort by creation date (newest first)
    allContent.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return NextResponse.json({ 
      success: true,
      content: allContent
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch content' 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, image_url, type, created_by, created_by_name, created_by_id, images, content, location, date } = await req.json();
    
    if (!title || !type || !created_by) {
      return NextResponse.json({ 
        success: false, 
        error: 'Title, type, and creator are required' 
      }, { status: 400 });
    }
    
    const newId = `${type}-${Date.now()}`;
    const now = new Date().toISOString();
    
    if (type === 'gallery') {
      const galleries = MockStorage.getGalleries()
      
      const newGallery = {
        _id: newId,
        title,
        category: title,
        description: description || `Gallery by ${created_by_name}`,
        images: images || [image_url].filter(Boolean),
        photographerId: created_by === 'photographer' ? created_by_id : null,
        photographerName: created_by === 'photographer' ? created_by_name : null,
        content_type: 'gallery',
        created_by: created_by_id,
        created_by_name,
        approved_by: created_by === 'admin' ? 'admin' : null,
        approved_by_name: created_by === 'admin' ? 'Admin' : null,
        status: created_by === 'admin' ? 'approved' : 'draft',
        showOnHome: created_by === 'admin',
        request_date: null,
        approved_at: created_by === 'admin' ? now : null,
        is_notified: false,
        createdAt: now,
        updatedAt: now
      };
      
      galleries.push(newGallery)
      MockStorage.saveGalleries(galleries)
      
    } else if (type === 'story') {
      const stories = MockStorage.getStories()
      
      const newStory = {
        _id: newId,
        title,
        content: content || description || '',
        imageUrl: image_url || '',
        coverImage: image_url || '',
        location: location || '',
        date: date || new Date().toISOString().split('T')[0],
        photographer: created_by_name,
        photographerId: created_by === 'photographer' ? created_by_id : null,
        photographerName: created_by === 'photographer' ? created_by_name : null,
        category: 'Wedding',
        tags: ['Wedding'],
        content_type: 'story',
        created_by: created_by_id,
        created_by_name,
        approved_by: created_by === 'admin' ? 'admin' : null,
        approved_by_name: created_by === 'admin' ? 'Admin' : null,
        status: created_by === 'admin' ? 'approved' : 'draft',
        showOnHome: created_by === 'admin',
        request_date: null,
        approved_at: created_by === 'admin' ? now : null,
        is_notified: false,
        createdAt: now,
        updatedAt: now
      };
      
      stories.push(newStory)
      MockStorage.saveStories(stories)
    }
    
    return NextResponse.json({ 
      success: true,
      message: `${type} created successfully`
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create content' 
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, status, approved_by, approved_by_id, showOnHome } = await req.json();
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Content ID is required' 
      }, { status: 400 });
    }
    
    const now = new Date().toISOString();
    let updated = false;
    
    // Try to update in galleries
    const galleries = MockStorage.getGalleries()
    const galleryIndex = galleries.findIndex((g: any) => g._id === id)
    
    if (galleryIndex !== -1) {
      if (status) galleries[galleryIndex].status = status
      if (approved_by) {
        galleries[galleryIndex].approved_by = approved_by
        galleries[galleryIndex].approved_by_name = approved_by === 'admin' ? 'Admin' : approved_by
        galleries[galleryIndex].approved_at = now
      }
      if (showOnHome !== undefined) galleries[galleryIndex].showOnHome = showOnHome
      galleries[galleryIndex].updatedAt = now
      
      MockStorage.saveGalleries(galleries)
      updated = true
    }
    
    // Try to update in stories
    if (!updated) {
      const stories = MockStorage.getStories()
      const storyIndex = stories.findIndex((s: any) => s._id === id)
      
      if (storyIndex !== -1) {
        if (status) stories[storyIndex].status = status
        if (approved_by) {
          stories[storyIndex].approved_by = approved_by
          stories[storyIndex].approved_by_name = approved_by === 'admin' ? 'Admin' : approved_by
          stories[storyIndex].approved_at = now
        }
        if (showOnHome !== undefined) stories[storyIndex].showOnHome = showOnHome
        stories[storyIndex].updatedAt = now
        
        MockStorage.saveStories(stories)
        updated = true
      }
    }
    
    if (!updated) {
      return NextResponse.json({ 
        success: false, 
        error: 'Content not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Content updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update content' 
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
        error: 'Content ID is required' 
      }, { status: 400 });
    }
    
    let deleted = false;
    
    // Try to delete from galleries
    const galleries = MockStorage.getGalleries()
    const galleryIndex = galleries.findIndex((g: any) => g._id === id)
    
    if (galleryIndex !== -1) {
      galleries.splice(galleryIndex, 1)
      MockStorage.saveGalleries(galleries)
      deleted = true
    }
    
    // Try to delete from stories
    if (!deleted) {
      const stories = MockStorage.getStories()
      const storyIndex = stories.findIndex((s: any) => s._id === id)
      
      if (storyIndex !== -1) {
        stories.splice(storyIndex, 1)
        MockStorage.saveStories(stories)
        deleted = true
      }
    }
    
    if (!deleted) {
      return NextResponse.json({ 
        success: false, 
        error: 'Content not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Content deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete content' 
    }, { status: 500 });
  }
}