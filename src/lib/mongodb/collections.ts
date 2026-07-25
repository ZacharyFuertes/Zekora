import { getDb } from "./client"
import { ObjectId } from "mongodb"

export interface CollectionDocument {
  _id?: ObjectId
  user_id: string
  name: string
  description: string
  mood: string
  color: string
  icon: string
  created_at: Date
}

export async function getCollections(userId: string) {
  const db = await getDb()
  return db
    .collection<CollectionDocument>("collections")
    .find({ user_id: userId })
    .sort({ created_at: -1 })
    .toArray()
}

export async function getCollection(id: string) {
  const db = await getDb()
  return db
    .collection<CollectionDocument>("collections")
    .findOne({ _id: new ObjectId(id) })
}

export async function createCollection(data: {
  user_id: string
  name: string
  description?: string
  mood?: string
  color?: string
  icon?: string
}) {
  const db = await getDb()
  const doc: CollectionDocument = {
    user_id: data.user_id,
    name: data.name,
    description: data.description ?? "",
    mood: data.mood ?? "calm",
    color: data.color ?? "#a78bfa",
    icon: data.icon ?? "folder",
    created_at: new Date(),
  }
  const result = await db.collection<CollectionDocument>("collections").insertOne(doc)
  return { ...doc, _id: result.insertedId }
}

export async function deleteCollection(id: string) {
  const db = await getDb()
  return db
    .collection<CollectionDocument>("collections")
    .deleteOne({ _id: new ObjectId(id) })
}
