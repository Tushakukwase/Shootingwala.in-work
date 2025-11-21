// app/api/cities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('photobook');
    
    // Check if cities collection exists
    const collections = await db.listCollections({ name: 'cities' }).toArray()
    if (collections.length === 0) {
      return NextResponse.json({ cities: [] })
    }
    
    const cities = db.collection('cities');
    const all = await cities.find({}).toArray();
    return NextResponse.json({ cities: all });
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json({ cities: [] })
  }
}