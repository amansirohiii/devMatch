import express, { Request, Response } from "express";
import { validateSignUpData } from "../utils/validation.js";
import bcrypt from "bcrypt";
import { checkAuthenticated } from "../middlewares/auth.js";
import User from "../models/user.js";
import { AuthenticatedRequest } from "../types/request";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
export const authRouter = express.Router();


authRouter.post("/signup", async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, age, gender } = req.body;
  try {
      validateSignUpData(req);
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({
          firstName,
          lastName,
          email,
          password: hashedPassword,
          age,
          gender,
      });
      await user.save();
      res.send("signup successful");
  } catch (error) {
      console.error(error);
      res.status(400).send("Error: " + error.message);
  }
});

authRouter.post("/login",checkAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
      // if(req.cookies.token){
      //     res.send("hi")
      // }
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
          throw new Error("Invalid Credentials");
      }
      const isPasswordValid = await user.validatePassword(password)
      if (isPasswordValid) {
          // res.cookie("token", token, {
          //     expires: new Date(Date.now() + 8 * 3600000),
          //   });
          req.session.userId = user._id;
          res.send("Login Successful");
      } else {
          throw new Error("Invalid Credentials");
      }
  } catch (error) {
      console.log(error);
      res.status(400).send("ERROR: " + error.message);
  }
});

authRouter.get("/logout", async(req,res)=>{
  req.session.destroy((err) => {
      if (err) {
          return res.status(500).send("Failed to logout");
        }
        res.clearCookie("connect.sid");
        res.send("Logout Successful");
  });

})