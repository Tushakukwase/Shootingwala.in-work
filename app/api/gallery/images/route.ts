import { NextRequest, NextResponse } from 'next/server';
import { MockStorage } from '@/lib/mock-storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    
    const galleries = MockStorage.getGalleries()
    
    // Filter galleries by search or category
    let filteredGalleries = galleries;
    
    if (category) {
      // Filter by exact category match
      filteredGalleries = galleries.filter((gallery: any) => 
        gallery.category?.toLowerCase() === category.toLowerCase()
      );
    } else if (search) {
      // Filter by search query
      const searchLower = search.toLowerCase();
      filteredGalleries = galleries.filter((gallery: any) => 
        gallery.title?.toLowerCase().includes(searchLower) ||
        gallery.category?.toLowerCase().includes(searchLower) ||
        gallery.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Transform galleries to individual images
    const images: any[] = []
    filteredGalleries.forEach((gallery: any) => {
      gallery.images.forEach((imageUrl: string, index: number) => {
        images.push({
          id: `${gallery._id}-${index}`,
          imageUrl,
          url: imageUrl,
          title: gallery.title || gallery.category,
          category: gallery.category,
          uploaderName: 'Admin',
          uploadDate: gallery.createdAt
        })
      })
    })
    
    return NextResponse.json({ 
      success: true,
      images: images
    });
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch images' 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { category, imageUrl, uploaderName } = await req.json();
    
    if (!category || !imageUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'Category and image URL are required' 
      }, { status: 400 });
    }
    
    const galleries = MockStorage.getGalleries()
    
    // Find existing gallery for this category or create new one
    let gallery = galleries.find((g: any) => g.category === category)
    
    if (!gallery) {
      gallery = {
        _id: `gallery-${Date.now()}`,
        title: `${category} Gallery`,
        category,
        description: `Gallery for ${category}`,
        images: [],
        status: 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      galleries.push(gallery)
    }
    
    // Add image to gallery
    gallery.images.push(imageUrl)
    gallery.updatedAt = new Date().toISOString()
    
    MockStorage.saveGalleries(galleries)
    
    return NextResponse.json({ 
      success: true,
      image: {
        id: `${gallery._id}-${gallery.images.length - 1}`,
        imageUrl,
        category,
        uploaderName: uploaderName || 'Admin',
        uploadDate: new Date().toISOString()
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error adding gallery image:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to add image' 
    }, { status: 500 });
  }
}