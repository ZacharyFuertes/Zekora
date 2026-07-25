import { MongoClient } from "mongodb"
import dns from "dns"

dns.setServers(["8.8.8.8", "8.8.4.4"])

const uri = process.env.MONGODB_URI ?? ""
let clientPromise: Promise<MongoClient> | null = null

function getClientPromise(): Promise<MongoClient> {
  if (!clientPromise) {
    const client = new MongoClient(uri)
    clientPromise = client.connect()
  }
  return clientPromise
}

export async function getDb() {
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not defined in .env.local. " +
      "Get your free MongoDB Atlas connection string at https://mongodb.com"
    )
  }
  const client = await getClientPromise()
  return client.db("zekora")
}
