import { NextRequest, NextResponse } from 'next/server';
import { MockStorage } from '@/lib/mock-storage';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const imageId = params.id
    
    if (!imageId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Image ID is required' 
      }, { status: 400 });
    }
    
    const galleries = MockStorage.getGalleries()
    
    // Find the gallery and image index
    let found = false
    for (const gallery of galleries) {
      const imageIndex = gallery.images.findIndex((_: any, index: number) => 
        `${gallery._id}-${index}` === imageId
      )
      
      if (imageIndex !== -1) {
        // Remove the image from the gallery
        gallery.images.splice(imageIndex, 1)
        gallery.updatedAt = new Date().toISOString()
        found = true
        break
      }
    }
    
    if (!found) {
      return NextResponse.json({ 
        success: false, 
        error: 'Image not found' 
      }, { status: 404 });
    }
    
    MockStorage.saveGalleries(galleries)
    
    return NextResponse.json({ 
      success: true,
      message: 'Image deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete image' 
    }, { status: 500 });
  }
}