import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please provide a first name"],
    minLength: [4, "First name should be at least 4 characters"],
  },
  lastName: {
    type: String,
    required: [true, "Please provide last a name"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    lowercase: true,
    trim: true,
    validate(value){
      if(!validator.isEmail(value)){
        throw new Error("Invalid email address: " + value);
      }
    }
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    validate(value){
      if(!validator.isStrongPassword(value)){
        throw new Error("Enter a strong Password: ");
      }
    }
  },
  age: {
    type: Number,
    required: [true, "Please provide an age"],
    min: [13, "Age must be greater than 13"],
  },
  gender: {
    type: String,
    enum: {
      values: ["male", "female", "others"],
      message: VALUE `{VALUE} is not a valid gender type`
    },
    required: [true, "Please provide gender"],
    },
  photoUrl: {
    type: String,
    default: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
    validate(value) {
      if (!validator.isURL(value)) {
        throw new Error("Invalid Photo URL: " + value);
      }
    },
  },
  about: {
    type: String,
    default: "Default about of the user",
  },
  skills:{
    type: [String],
    default: [],
  },
}, {timestamps: true})

const UserModel= mongoose.models.User || mongoose.model("User", userSchema);
export default UserModel;