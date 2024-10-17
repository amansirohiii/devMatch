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
  }

};