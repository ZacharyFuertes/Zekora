import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI ?? ""
const options = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
}

let clientPromise: Promise<MongoClient> | null = null

function getClientPromise(): Promise<MongoClient> {
  if (!clientPromise) {
    const client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }
  return clientPromise
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
    return client.db("zekora")
  } catch (error) {
    clientPromise = null
    throw error
  }
}
