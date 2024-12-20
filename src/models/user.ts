import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

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
    validate(value: string){
      if(!validator.isEmail(value)){
        throw new Error("Invalid email address: " + value);
      }
    }
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    validate(value: string){
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
      message:`{VALUE} is not a valid gender type`
    },
    required: [true, "Please provide gender"],
    },
  photoUrl: {
    type: String,
    default: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
    validate(value: string) {
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
location: {
  type: {
    type: String,
    enum: ['Point', 'LineString', 'Polygon'],
  },
  coordinates: {
    type: [Number],
  }
}


}, {timestamps: true})

userSchema.methods.validatePassword = async function(passwordInput: string){
  const user = this;
  const passwordHash = user.password;

  const isPasswordValid = await bcrypt.compare(passwordInput, passwordHash);
  return isPasswordValid;
}

userSchema.index({ location: "2dsphere" });


const User= mongoose.models.User || mongoose.model("User", userSchema);
export default User;