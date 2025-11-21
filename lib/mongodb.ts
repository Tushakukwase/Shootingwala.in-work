// lib/mongodb.ts
import { MongoClient } from 'mongodb'

if (!process.env.MONGO_URI) {
  // During build, return a mock client promise
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    console.log('MONGO_URI not available during build, using mock connection')
  } else {
    throw new Error('Invalid/Missing environment variable: "MONGO_URI"')
  }
}

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/dummy' // Fallback for build

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 30000,
  // Remove TLS for build or use more permissive settings
  ...(process.env.NODE_ENV === 'production' && {
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
  })
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// Mock client for build time
const mockClientPromise = Promise.resolve({
  db: () => ({
    collection: () => ({
      find: () => ({
        toArray: () => Promise.resolve([]),
        limit: function() { return this },
        sort: function() { return this }
      }),
      findOne: () => Promise.resolve(null),
      insertOne: () => Promise.resolve({ insertedId: 'mock' }),
      updateOne: () => Promise.resolve({ matchedCount: 0 }),
      countDocuments: () => Promise.resolve(0)
    }),
    listCollections: () => ({
      toArray: () => Promise.resolve([])
    })
  })
}) as any

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect().catch(err => {
      console.error('MongoDB connection failed, using mock:', err)
      return mockClientPromise
    })
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production/build, try to connect but fallback to mock
  try {
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  } catch (error) {
    console.error('MongoDB connection failed, using mock:', error)
    clientPromise = mockClientPromise
  }
}

export default clientPromise