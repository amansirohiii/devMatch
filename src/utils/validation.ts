import { Request } from "express";
import validator from "validator";
export const validateSignUpData = (req: Request)=>{
  const {firstName, lastName, email, password} = req.body;
  if (!firstName || !lastName) {
    throw new Error("Name is not valid!");
  } else if (!validator.isEmail(email)) {
    throw new Error("Email is not valid!");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong Password!");
  } else if (!req.file) {
    throw new Error("Please upload a photo!");
  } else if (!req.body.age || !validator.isInt(req.body.age) || req.body.age < 13) {
    throw new Error("Age is not valid");
  }
};

export const validateEditProfileData = (req: Request)=>{
  const allowedEdits = ["firstName", "lastName", "password", "age", "photoUrl", "about", "skills"];

  const isEditAllowed = Object.keys(req.body).every((edit) => allowedEdits.includes(edit));

  if (!isEditAllowed) {
    throw new Error("Invalid Edit");
  }

  const {firstName, lastName, password, age, photoUrl, about, skills} = req.body;

  if (firstName && !validator.isLength(firstName, { min: 1, max: 50 })) {
    throw new Error("First Name is not valid");
  }
  if (lastName && !validator.isLength(firstName, { min: 1, max: 50 })) {
    throw new Error("Last Name is not valid");
  }
  if (password && !validator.isStrongPassword(password)) {
    throw new Error("Password must be at least 8 characters long and include uppercase, lowercase, numbers, and symbols");
  }
  if (age && !validator.isInt(age) || age < 18 || age > 100) {
    throw new Error("Age is not valid");
  }
  if (photoUrl && !validator.isURL(photoUrl)) {
    throw new Error("Invalid photo URL");
  }
  if (about && !validator.isLength(about, { max: 300 })) {
    throw new Error("About section must be 300 characters or less");
  }
  if (skills && (!Array.isArray(skills) || !skills.every(skill => typeof skill === 'string'))) {
    throw new Error("Skills must be an array of strings");
  }

  return true;
};