// app/api/photographers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId, Document } from 'mongodb';

// Define types for better TypeScript support
interface Photographer extends Document {
  _id: ObjectId;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  categories?: string[];
  image?: string;
  description?: string;
  experience?: number;
  rating?: number;
  isActive?: boolean;
  status?: string;
  // Add other fields as needed
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const approved = searchParams.get('approved');
    
    const client = await clientPromise;
    const db = client.db('photobook');
    
    // Check if studios collection exists (photographers are stored in studios)
    const collections = await db.listCollections({ name: 'studios' }).toArray();
    let photographers: Photographer[] = []; // Explicitly type the array
    
    if (collections.length > 0) {
      const studios = db.collection<Photographer>('studios');
      
      let query: any = {};
      if (approved === 'true') {
        query.isActive = true;
        query.status = 'approved';
      }
      
      photographers = await studios.find(query).limit(20).toArray();
    }
    
    return NextResponse.json({ 
      success: true,
      photographers: photographers.map(p => ({
        ...p,
        _id: p._id.toString(),
        id: p._id.toString()
      }))
    });
  } catch (error: any) {
    console.error('Error fetching photographers:', error);
    return NextResponse.json({ 
      success: true, 
      photographers: []
    });
  }
}