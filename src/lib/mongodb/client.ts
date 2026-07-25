import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI ?? ""
const options = {
  maxPoolSize: 10,
  minPoolSize: 0,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
  socketTimeoutMS: 30000,
  keepAlive: true,
  keepAliveInitialDelay: 300000,
}

const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>
  _indexesEnsured?: boolean
}

function getClientPromise(): Promise<MongoClient> {
  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  return globalWithMongo._mongoClientPromise
}

async function ensureIndexes(db: import("mongodb").Db) {
  if (globalWithMongo._indexesEnsured) return
  await Promise.all([
    db.collection("notes").createIndex({ user_id: 1, updated_at: -1 }),
    db.collection("notes").createIndex({ user_id: 1, file_id: 1 }),
    db.collection("collections").createIndex({ user_id: 1, created_at: -1 }),
    db.collection("tags").createIndex({ user_id: 1, name: 1 }, { unique: true }),
  ]).catch(() => {})
  globalWithMongo._indexesEnsured = true
}

export async function getDb() {
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not defined. " +
      "Set it in your environment variables (Vercel dashboard or .env.local)."
    )
  }
  try {
    const client = await getClientPromise()
    const db = client.db("zekora")
    ensureIndexes(db)
    return db
  } catch (error) {
    globalWithMongo._mongoClientPromise = undefined
    throw error
  }
}
