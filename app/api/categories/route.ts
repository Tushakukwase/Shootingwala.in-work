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
    const categories = db.collection('categories');

    // Prevent duplicate category names (case-insensitive)
    const existing = await categories.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) {
      return NextResponse.json({ error: 'A category with this name already exists.' }, { status: 409 });
    }

    const newCategory = {
      name,
      image,
      selected: false, // Default to not selected for dashboard display
      show_on_home: false, // Default to not shown on home page
      createdAt: new Date(),
    };
    const result = await categories.insertOne(newCategory);
    return NextResponse.json({ ...newCategory, _id: result.insertedId }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding category:', error);
    return NextResponse.json({ error: 'Failed to add category', details: error?.message || error?.toString() }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('photobook');
    const categories = db.collection('categories');
    const all = await categories.find({}).toArray();
    return NextResponse.json({ categories: all });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Category id is required.' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db('photobook');
    const categories = db.collection('categories');
    
    // First check if category exists
    const existingCategory = await categories.findOne({ _id: new ObjectId(id) });
    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }
    
    // Delete the category
    const result = await categories.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Failed to delete category.' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Category deleted successfully',
      deletedId: id 
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Failed to delete category.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, name, image } = await req.json();
    if (!id || !name || !image) {
      return NextResponse.json({ error: 'Category id, name, and image are required.' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db('photobook');
    const categories = db.collection('categories');
    
    // Prevent duplicate category names (case-insensitive, excluding self)
    const existing = await categories.findOne({ 
      name: { $regex: `^${name}$`, $options: 'i' }, 
      _id: { $ne: new ObjectId(id) } 
    });
    if (existing) {
      return NextResponse.json({ error: 'A category with this name already exists.' }, { status: 409 });
    }
    
    const result = await categories.updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, image, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update category.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, action } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Category id is required.' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('photobook');
    const categories = db.collection('categories');
    
    if (action === 'toggle-selection') {
      const category = await categories.findOne({ _id: new ObjectId(id) });
      if (!category) {
        return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
      }
      
      // Handle case where selected might be undefined (for existing records)
      const currentSelected = category.selected || false;
      const newSelected = !currentSelected;
      
      const result = await categories.updateOne(
        { _id: new ObjectId(id) },
        { $set: { selected: newSelected, updatedAt: new Date() } }
      );
      
      return NextResponse.json({ success: true, selected: newSelected });
    }
    
    if (action === 'toggle-show-on-home') {
      const category = await categories.findOne({ _id: new ObjectId(id) });
      if (!category) {
        return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
      }
      
      // Handle case where show_on_home might be undefined (for existing records)
      const currentShowOnHome = category.show_on_home || false;
      const newShowOnHome = !currentShowOnHome;
      
      const result = await categories.updateOne(
        { _id: new ObjectId(id) },
        { $set: { show_on_home: newShowOnHome, updatedAt: new Date() } }
      );
      
      return NextResponse.json({ success: true, show_on_home: newShowOnHome });
    }
    
    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update category.' }, { status: 500 });
  }
}