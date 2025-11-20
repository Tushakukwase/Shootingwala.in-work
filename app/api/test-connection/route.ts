import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

export async function GET() {
  let client: MongoClient | null = null
  
  try {
    console.log('Testing direct MongoDB connection...')
    console.log('MONGO_URI exists:', !!process.env.MONGO_URI)
    
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set')
    }
    
    // Create a new client with minimal options
    client = new MongoClient(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    })
    
    console.log('Connecting to MongoDB...')
    await client.connect()
    console.log('Connected successfully!')
    
    // Test database access
    const db = client.db('photobook')
    const result = await db.admin().ping()
    console.log('Ping successful:', result)
    
    // List collections
    const collections = await db.listCollections().toArray()
    console.log('Collections:', collections.map(c => c.name))
    
    return NextResponse.json({
      success: true,
      message: 'Direct connection successful',
      database: 'photobook',
      collections: collections.map(c => c.name),
      ping: result
    })
    
  } catch (error) {
    console.error('Connection error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
    
  } finally {
    if (client) {
      try {
        await client.close()
        console.log('Connection closed')
      } catch (closeError) {
        console.error('Error closing connection:', closeError)
      }
    }
  }
}