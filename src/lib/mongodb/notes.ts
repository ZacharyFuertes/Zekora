import { getDb } from "./client"
import { ObjectId } from "mongodb"

export interface NoteDocument {
  _id?: ObjectId
  user_id: string
  title: string
  content: string
  type: "standalone" | "file-attachment"
  file_id?: string
  tags: string[]
  collection_id?: string
  mood?: string
  created_at: Date
  updated_at: Date
}

export async function getNotes(userId: string) {
  const db = await getDb()
  return db
    .collection<NoteDocument>("notes")
    .find({ user_id: userId })
    .sort({ updated_at: -1 })
    .toArray()
}

export async function getNote(id: string) {
  const db = await getDb()
  return db
    .collection<NoteDocument>("notes")
    .findOne({ _id: new ObjectId(id) })
}

export async function getNotesByFile(userId: string, fileId: string) {
  const db = await getDb()
  return db
    .collection<NoteDocument>("notes")
    .find({ user_id: userId, file_id: fileId })
    .sort({ updated_at: -1 })
    .toArray()
}

export async function createNote(data: {
  user_id: string
  title: string
  content: string
  type: "standalone" | "file-attachment"
  file_id?: string
  tags: string[]
  collection_id?: string
  mood?: string
}) {
  const db = await getDb()
  const doc: NoteDocument = {
    ...data,
    created_at: new Date(),
    updated_at: new Date(),
  }
  const result = await db.collection<NoteDocument>("notes").insertOne(doc)
  return { ...doc, _id: result.insertedId }
}

export async function updateNote(
  id: string,
  data: Partial<Omit<NoteDocument, "_id" | "user_id" | "created_at">>
) {
  const db = await getDb()
  await db.collection<NoteDocument>("notes").updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...data, updated_at: new Date() } }
  )
  return getNote(id)
}

export async function deleteNote(id: string) {
  const db = await getDb()
  return db
    .collection<NoteDocument>("notes")
    .deleteOne({ _id: new ObjectId(id) })
}
