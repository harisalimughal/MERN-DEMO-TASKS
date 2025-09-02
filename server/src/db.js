import mongoose from "mongoose";

export async function connectDB(uri) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    maxPoolSize: 10
  });
  mongoose.connection.on("error", (err) => {
    console.error("Mongo connection error:", err);
  });
}
