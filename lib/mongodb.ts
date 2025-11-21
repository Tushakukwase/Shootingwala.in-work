import { MongoClient, MongoClientOptions } from 'mongodb'

if (!process.env.MONGO_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGO_URI"')
}

const uri = process.env.MONGO_URI

// Simplified options - remove problematic settings
const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 10000, // Increased timeout
  socketTimeoutMS: 45000,
  
  // Remove compressors and simplify TLS
  tls: true,
  // Remove tlsAllowInvalidCertificates and tlsAllowInvalidHostnames - let driver handle it
  retryWrites: true,
  w: 'majority',
}

// Global variables for connection caching
let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

async function createIndexes(db: any) {
  try {
    const studios = db.collection('studios')
    await studios.createIndex({ email: 1 }, { unique: true })
    await studios.createIndex({ isActive: 1, status: 1 })
    await studios.createIndex({ categories: 1 })
    await studios.createIndex({ location: 1 })
    await studios.createIndex({ rating: -1, experience: -1, createdAt: -1 })

    const profiles = db.collection('photographer_profiles')
    await profiles.createIndex({ photographerId: 1 })

    const reviews = db.collection('reviews')
    await reviews.createIndex({ photographerId: 1 })
    await reviews.createIndex({ approved: 1 })
    await reviews.createIndex({ createdAt: -1 })
    await reviews.createIndex({ photographerId: 1, approved: 1 })

    const galleries = db.collection('galleries')
    await galleries.createIndex({ status: 1, showOnHome: 1 })
    await galleries.createIndex({ photographerId: 1 })

    const stories = db.collection('stories')
    await stories.createIndex({ status: 1, showOnHome: 1 })

    const categories = db.collection('categories')
    await categories.createIndex({ selected: 1 })

    const cities = db.collection('cities')
    await cities.createIndex({ show_on_home: 1 })

    console.log('Database indexes created/verified successfully')
  } catch (error) {
    console.error('Error creating indexes:', error)
    // Don't throw error for index creation - connection is more important
  }
}

async function connectWithRetry(retries = 3): Promise<MongoClient> {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempting MongoDB connection (attempt ${i + 1}/${retries})...`)
      
      const client = new MongoClient(uri, options)
      await client.connect()
      
      console.log('✅ MongoDB connected successfully')
      
      // Create indexes after successful connection
      const db = client.db('photobook')
      await createIndexes(db)
      
      return client
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${i + 1} failed:`, error)
      
      if (i === retries - 1) {
        console.error('💥 All connection attempts failed')
        throw error
      }
      
      // Exponential backoff
      const delay = Math.pow(2, i) * 1000
      console.log(`Waiting ${delay}ms before next attempt...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new Error('Failed to connect to MongoDB after retries')
}

function getClientPromise(): Promise<MongoClient> {
  if (clientPromise) {
    return clientPromise
  }

  if (process.env.NODE_ENV === 'development') {
    // In development, use global variable to preserve connection during hot-reload
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }
    
    if (!globalWithMongo._mongoClientPromise) {
      globalWithMongo._mongoClientPromise = connectWithRetry()
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    // In production, create new connection
    clientPromise = connectWithRetry()
  }

  return clientPromise
}

// Export the client promise
clientPromise = getClientPromise()
export default clientPromise