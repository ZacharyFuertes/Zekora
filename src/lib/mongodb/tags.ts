import { ObjectId } from "mongodb"
import { getDb } from "./client"

export interface TagDocument {
  _id?: ObjectId
  user_id: string
  name: string
  color: string
  created_at: Date
}

export async function getTags(userId: string) {
  const db = await getDb()
  return db
    .collection<TagDocument>("tags")
    .find({ user_id: userId })
    .sort({ name: 1 })
    .toArray()
}

export async function createTag(data: {
  user_id: string
  name: string
  color?: string
}) {
  const db = await getDb()
  const existing = await db
    .collection<TagDocument>("tags")
    .findOne({ user_id: data.user_id, name: data.name })
  if (existing) return existing

  const doc: TagDocument = {
    user_id: data.user_id,
    name: data.name,
    color: data.color ?? "#a78bfa",
    created_at: new Date(),
  }
  const result = await db.collection<TagDocument>("tags").insertOne(doc)
  return { ...doc, _id: result.insertedId }
}

export async function deleteTag(id: string) {
  const db = await getDb()
  return db.collection<TagDocument>("tags").deleteOne({ _id: new ObjectId(id) })
}
