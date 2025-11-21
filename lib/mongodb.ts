// lib/mongodb.ts
import { MongoClient } from 'mongodb'

if (!process.env.MONGO_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGO_URI"')
}

const uri = process.env.MONGO_URI

// Render-compatible MongoDB options
const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  // SSL/TLS configuration for Render
  ssl: true,
  tlsAllowInvalidCertificates: false,
  // Use new URL parser and unified topology (deprecated but sometimes needed)
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

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

// Add error handling for the connection
clientPromise.catch((error) => {
  console.error('Failed to connect to MongoDB:', error)
})

export default clientPromise