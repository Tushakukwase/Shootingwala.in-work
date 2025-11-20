import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, location, categories, image, description, experience, rating, createdBy, startingPrice, tags } = await req.json();
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db('photobook');
    const photographers = db.collection('photographers');

    // Prevent duplicate photographer emails
    const existing = await photographers.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'A photographer with this email already exists.' }, { status: 409 });
    }

    const newPhotographer = {
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      location: location || '',
      categories: Array.isArray(categories) ? categories : [],
      image: image || null,
      description: description || '',
      experience: experience || 0,
      rating: createdBy === 'admin' ? 0 : (rating || 0),
      isVerified: false,
      isApproved: createdBy === 'admin' ? true : false, // Admin-created are auto-approved
      status: createdBy === 'admin' ? 'approved' : 'pending',
      createdBy: createdBy || 'self',
      startingPrice: startingPrice || 200,
      tags: tags || categories || [],
      createdAt: new Date(),
      registrationDate: new Date(),
    };
    const result = await photographers.insertOne(newPhotographer);
    return NextResponse.json({ ...newPhotographer, _id: result.insertedId }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding photographer:', error);
    return NextResponse.json({ error: 'Failed to add photographer', details: error?.message || error?.toString() }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const approved = searchParams.get('approved');
    const userId = searchParams.get('userId');
    const personalized = searchParams.get('personalized');
    const categories = searchParams.get('categories');
    const location = searchParams.get('location');
    const priceRange = searchParams.get('priceRange');
    
    const client = await clientPromise;
    const db = client.db('photobook');
    const photographers = db.collection('photographers');
    
    let query: any = {};
    
    if (approved === 'true') {
      query.isApproved = true;
    } else if (approved === 'false') {
      query.isApproved = false;
    }
    
    // Handle personalized filtering
    if (personalized === 'true' && userId) {
      // Apply preference-based filtering
      if (categories) {
        const categoryList = categories.split(',');
        query.categories = { $in: categoryList };
      }
      
      if (location) {
        query.location = { $regex: location, $options: 'i' };
      }
      
      if (priceRange) {
        // Define price ranges
        const priceRanges: { [key: string]: { min: number; max: number } } = {
          'low': { min: 0, max: 500 },
          'medium': { min: 500, max: 1500 },
          'high': { min: 1500, max: 5000 },
          'premium': { min: 5000, max: 999999 }
        };
        
        if (priceRanges[priceRange]) {
          query.startingPrice = {
            $gte: priceRanges[priceRange].min,
            $lte: priceRanges[priceRange].max
          };
        }
      }
    } else {
      // Handle regular filtering (non-personalized)
      if (category) {
        query.categories = { $in: [category] };
      }
      
      if (city) {
        query.location = { $regex: city, $options: 'i' };
      }
    }
    
    // Fetch photographers
    let photographers_result = await photographers.find(query).toArray();
    
    // Apply intelligent sorting for personalized results
    if (personalized === 'true') {
      photographers_result = photographers_result.sort((a: any, b: any) => {
        // Prioritize photographers with higher ratings
        if (b.rating !== a.rating) {
          return (b.rating || 0) - (a.rating || 0);
        }
        // Then by experience
        if (b.experience !== a.experience) {
          return (b.experience || 0) - (a.experience || 0);
        }
        // Finally by creation date (newer first)
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    } else {
      // Default sorting for non-personalized results
      photographers_result = photographers_result.sort((a: any, b: any) => {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    }
    
    return NextResponse.json({ 
      success: true,
      photographers: photographers_result.map(photographer => ({
        ...photographer,
        _id: photographer._id.toString(),
        rating: photographer.rating || 0,
        isApproved: photographer.isApproved || false,
        createdBy: photographer.createdBy || 'admin',
        startingPrice: photographer.startingPrice || 200,
        tags: photographer.tags || photographer.categories || [],
        experience: photographer.experience || 0,
        completedProjects: photographer.completedProjects || 0
      })),
      isPersonalized: personalized === 'true',
      appliedFilters: {
        categories: categories?.split(',') || [],
        location: location || null,
        priceRange: priceRange || null
      }
    });
  } catch (error) {
    console.error('Error fetching photographers:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch photographers.',
      photographers: []
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, name, email, phone, location, categories, image, description, experience, rating } = await req.json();
    if (!id || !name || !email) {
      return NextResponse.json({ error: 'ID, name, and email are required.' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('photobook');
    const photographers = db.collection('photographers');
    
    // Prevent duplicate photographer emails (excluding self)
    const existing = await photographers.findOne({ 
      email: email.toLowerCase(), 
      _id: { $ne: new ObjectId(id) } 
    });
    if (existing) {
      return NextResponse.json({ error: 'A photographer with this email already exists.' }, { status: 409 });
    }
    
    const updateData = {
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      location: location || '',
      categories: Array.isArray(categories) ? categories : [],
      image: image || null,
      description: description || '',
      experience: experience || 0,
      rating: rating || 5,
      updatedAt: new Date(),
    };
    
    const result = await photographers.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Photographer not found.' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating photographer:', error);
    return NextResponse.json({ error: 'Failed to update photographer.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Photographer id is required.' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db('photobook');
    const photographers = db.collection('photographers');
    const result = await photographers.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Photographer not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete photographer.' }, { status: 500 });
  }
}