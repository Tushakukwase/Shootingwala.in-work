// lib/mongodb.ts
import { MongoClient } from 'mongodb'

if (!process.env.MONGO_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGO_URI"')
}

const uri = process.env.MONGO_URI

// Updated MongoDB options for Render compatibility
const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  // Critical: Remove TLS options that cause issues on Render
  // Let MongoDB driver handle TLS automatically
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// Simple connection without complex error handling during build
if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // Production: Simple connection
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise