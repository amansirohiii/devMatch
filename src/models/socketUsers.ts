import mongoose from "mongoose";

const socketUsersSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: [true, "Please provide a user id"],
  },
  socketId: {
    type: String,
    required: [true, "Please provide a socket id"],
  },
});

const SocketUsers = mongoose.model("SocketUsers", socketUsersSchema);
export default SocketUsers;