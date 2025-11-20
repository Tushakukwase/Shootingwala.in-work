import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// POST: Save hero image to MongoDB
export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: 'Image data is required.' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db('photobook');
    const settings = db.collection('settings');
    await settings.updateOne(
      { key: 'heroImg' },
      { $set: { key: 'heroImg', value: image, updatedAt: new Date() } },
      { upsert: true }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save image.' }, { status: 500 });
  }
}

// GET: Retrieve hero image from MongoDB
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('photobook');
    const settings = db.collection('settings');
    const doc = await settings.findOne({ key: 'heroImg' });
    if (!doc || !doc.value) {
      return NextResponse.json({ error: 'No hero image set.' }, { status: 404 });
    }
    return NextResponse.json({ image: doc.value });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch image.' }, { status: 500 });
  }
}