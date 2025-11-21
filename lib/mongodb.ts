import { MongoClient, MongoClientOptions } from 'mongodb'

if (!process.env.MONGO_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGO_URI"')
}

const uri = process.env.MONGO_URI
const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  compressors: ['zlib'],

  // TLS configuration
  tls: true,
  tlsAllowInvalidCertificates: false, // strict mode
  tlsAllowInvalidHostnames: false,
  retryWrites: true,
  retryReads: true,
  w: 'majority',
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

const createConnection = async (retries = 3): Promise<MongoClient> => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = new MongoClient(uri, options)
      await client.connect()
      console.log('MongoDB connected successfully')
      
      const db = client.db('photobook')

      // Create indexes
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

      console.log('Database indexes created successfully')
      return client
    } catch (error) {
      console.error(`MongoDB connection attempt ${i + 1} failed:`, error)
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
    }
  }
  throw new Error('Failed to connect to MongoDB after retries')
}

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & { _mongoClientPromise?: Promise<MongoClient> }
  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = createConnection()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  clientPromise = createConnection()
}

export default clientPromise
