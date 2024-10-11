import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please provide a first name"],
  },
  lastName: {
    type: String,
    required: [true, "Please provide last a name"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  age: {
    type: Number,
    required: [true, "Please provide an age"],
  },
  gender: {
    type: String,
    enum: ["male", "female", "others"],
    required: [true, "Please provide gender"],
  },
})

const UserModel= mongoose.models.User || mongoose.model("User", userSchema);
export default UserModel;