import { NextRequest, NextResponse } from 'next/server';
import { MockStorage } from '@/lib/mock-storage';

export async function GET() {
  try {
    const galleries = MockStorage.getGalleries()
    
    // Extract unique categories from galleries
    const categoryNames = [...new Set(galleries.map((g: any) => g.category))]
    const categories = categoryNames.map((name: string) => {
      const categoryGalleries = galleries.filter((g: any) => g.category === name)
      return {
        name,
        imageCount: categoryGalleries.reduce((sum: number, g: any) => sum + g.images.length, 0),
        sampleImage: categoryGalleries[0]?.images[0] || '/placeholder.svg'
      }
    })
    
    return NextResponse.json({ 
      success: true,
      categories: categories
    });
  } catch (error) {
    console.error('Error fetching gallery categories:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch categories' 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    
    if (!name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Category name is required' 
      }, { status: 400 });
    }
    
    // Create a new empty gallery for this category
    const galleries = MockStorage.getGalleries()
    
    const newGallery = {
      _id: `gallery-${Date.now()}`,
      title: `${name} Gallery`,
      category: name,
      description: `Gallery for ${name}`,
      images: [],
      status: 'approved',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    galleries.push(newGallery)
    MockStorage.saveGalleries(galleries)
    
    return NextResponse.json({ 
      success: true,
      category: {
        name,
        imageCount: 0,
        sampleImage: '/placeholder.svg'
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating gallery category:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create category' 
    }, { status: 500 });
  }
}