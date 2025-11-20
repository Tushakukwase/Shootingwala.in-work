import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const { name, image } = await req.json();
    if (!name || !image) {
      return NextResponse.json({ error: 'Name and image are required.' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db('photobook');
    const cities = db.collection('cities');

    // Prevent duplicate city names (case-insensitive)
    const existing = await cities.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) {
      return NextResponse.json({ error: 'A city with this name already exists.' }, { status: 409 });
    }

    const newCity = {
      name,
      image,
      selected: false, // Default to not selected
      show_on_home: false, // Default to not shown on home page
      createdAt: new Date(),
    };
    const result = await cities.insertOne(newCity);
    return NextResponse.json({ ...newCity, _id: result.insertedId }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding city:', error);
    return NextResponse.json({ error: 'Failed to add city', details: error?.message || error?.toString() }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('photobook');
    const cities = db.collection('cities');
    // Return all cities from the cities collection (all are admin-approved)
    const all = await cities.find({}).toArray();
    return NextResponse.json({ cities: all });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cities.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'City id is required.' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db('photobook');
    const cities = db.collection('cities');
    
    // First check if city exists
    const existingCity = await cities.findOne({ _id: new ObjectId(id) });
    if (!existingCity) {
      return NextResponse.json({ error: 'City not found.' }, { status: 404 });
    }
    
    // Delete the city
    const result = await cities.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Failed to delete city.' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'City deleted successfully',
      deletedId: id 
    });
  } catch (error) {
    console.error('Delete city error:', error);
    return NextResponse.json({ error: 'Failed to delete city.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, name, image } = await req.json();
    if (!id || !name || !image) {
      return NextResponse.json({ error: 'City id, name, and image are required.' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db('photobook');
    const cities = db.collection('cities');
    
    // Prevent duplicate city names (case-insensitive, excluding self)
    const existing = await cities.findOne({ 
      name: { $regex: `^${name}$`, $options: 'i' }, 
      _id: { $ne: new ObjectId(id) } 
    });
    if (existing) {
      return NextResponse.json({ error: 'A city with this name already exists.' }, { status: 409 });
    }
    
    const result = await cities.updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, image, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'City not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update city.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, action } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'City id is required.' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('photobook');
    const cities = db.collection('cities');
    
    if (action === 'toggle-selection') {
      const city = await cities.findOne({ _id: new ObjectId(id) });
      if (!city) {
        return NextResponse.json({ error: 'City not found.' }, { status: 404 });
      }
      
      // Handle case where selected might be undefined (for existing records)
      const currentSelected = city.selected || false;
      const newSelected = !currentSelected;
      
      const result = await cities.updateOne(
        { _id: new ObjectId(id) },
        { $set: { selected: newSelected, updatedAt: new Date() } }
      );
      
      return NextResponse.json({ success: true, selected: newSelected });
    }
    
    if (action === 'toggle-show-on-home') {
      const city = await cities.findOne({ _id: new ObjectId(id) });
      if (!city) {
        return NextResponse.json({ error: 'City not found.' }, { status: 404 });
      }
      
      // Handle case where show_on_home might be undefined (for existing records)
      const currentShowOnHome = city.show_on_home || false;
      const newShowOnHome = !currentShowOnHome;
      
      const result = await cities.updateOne(
        { _id: new ObjectId(id) },
        { $set: { show_on_home: newShowOnHome, updatedAt: new Date() } }
      );
      
      return NextResponse.json({ success: true, show_on_home: newShowOnHome });
    }
    
    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update city.' }, { status: 500 });
  }
}