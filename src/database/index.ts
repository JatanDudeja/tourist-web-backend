import mongoose from "mongoose";

async function connectToDB() {
  const dbURL: string = process.env.DB_URI as string;
  const db = await mongoose.connect(dbURL);
  if (!db) {
    throw new Error("Unable to connect to DB!");
  } else {
    console.log("Connected to DB!");
  }
}

export default connectToDB;
