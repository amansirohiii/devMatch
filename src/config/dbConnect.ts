import mongoose from "mongoose";

interface ConnectionType {
  isConnected?: number;
}
const connection: ConnectionType = {};
export const dbConnect = async ()=>{
  if (connection.isConnected){
    console.log("Using existing connection");
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);
    connection.isConnected = db.connections[0].readyState;
    console.log("Database connected");

  } catch (error) {
console.error("Error connecting Database", error);
process.exit(1);
  }
}