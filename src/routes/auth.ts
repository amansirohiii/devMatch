import express, { Request, Response } from "express";
import { validateSignUpData } from "../utils/validation.js";
import { checkAuthenticated } from "../middlewares/auth.js";
import User from "../models/user.js";
import { AuthenticatedRequest } from "../types/request";
import { hashPassword } from "../utils/hashPassword.js";
import { upload, uploadImage } from "../utils/uploadImage.js";
export const authRouter = express.Router();

authRouter.post("/signup", upload.single("image"), async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, age, gender } = req.body;
  try {
      validateSignUpData(req);
      const hashedPassword = hashPassword(password);

      const user = new User({
          firstName,
          lastName,
          email,
          password: hashedPassword,
          age,
          gender,
      });
      await user.save();
      if(req.file){
        const fileUrl = await uploadImage({file: req.file, user: user});
        user.photoUrl = fileUrl.Location;
      }
      await user.save();
      res.status(200).json({message: "signup successful"});
  } catch (error) {
      console.error(error);
      res.status(400).json({message: "Error: " + error.message});
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
          res.status(200).json({message: "Login Successful"});
      } else {
          throw new Error("Invalid Credentials");
      }
  } catch (error) {
      console.log(error);
      res.status(400).json({message: "ERROR: " + error.message});
  }
});

authRouter.get("/logout", async(req,res)=>{
  req.session.destroy((err) => {
      if (err) {
          return res.status(500).json({message: "Failed to logout"});
        }
        res.clearCookie("connect.sid");
        res.status(200).json({message: "Logout Successful"});
  });

})