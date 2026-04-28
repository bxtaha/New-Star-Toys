import mongoose from "mongoose";

const MONGODB_URI = String(process.env.MONGODB_URI || process.env.MONGO_URL || "").trim();
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "ycnst";

const globalForMongoose = globalThis;

if (!globalForMongoose.__mongooseConnection) {
  globalForMongoose.__mongooseConnection = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (globalForMongoose.__mongooseConnection.conn) {
    return globalForMongoose.__mongooseConnection.conn;
  }

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set on the server.");
  }

  if (!globalForMongoose.__mongooseConnection.promise) {
    globalForMongoose.__mongooseConnection.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: MONGODB_DB_NAME,
        serverSelectionTimeoutMS: 10_000,
        connectTimeoutMS: 10_000,
      })
      .then((connection) => connection);
  }

  try {
    globalForMongoose.__mongooseConnection.conn = await globalForMongoose.__mongooseConnection.promise;
    return globalForMongoose.__mongooseConnection.conn;
  } catch (error) {
    globalForMongoose.__mongooseConnection.promise = null;
    globalForMongoose.__mongooseConnection.conn = null;
    throw error;
  }
}

export function getDatabaseConfig() {
  return {
    uri: MONGODB_URI,
    dbName: MONGODB_DB_NAME,
  };
}
