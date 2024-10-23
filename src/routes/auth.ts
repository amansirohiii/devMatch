import express, { Request, Response } from "express";
import { validateSignUpData } from "../utils/validation.js";
import User from "../models/user.js";
import { AuthenticatedRequest } from "../types/request";
import { hashPassword } from "../utils/hashPassword.js";
import { upload, uploadImage } from "../utils/uploadImage.js";
import { checkAuth, userAuth } from "../middlewares/auth.js";
import { filterUser } from "../utils/filterUser.js";
export const authRouter = express.Router();

authRouter.post("/signup", upload.single("image"), async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, age, gender, about, skills, location } = req.body;
  try {
    validateSignUpData(req);

      const hashedPassword = await hashPassword(password);
      const user = new User({
          firstName,
          lastName,
          email,
          password: hashedPassword,
          age,
          gender,
          about,
            skills,
          location: location ? {
            type: "Point",
            coordinates: [
                (location.coordinates[0]),
                (location.coordinates[1])
            ]
        } : undefined
    });
      await user.save();
      if (req.file) {
          const fileUrl = await uploadImage({ file: req.file, user });
          user.photoUrl = fileUrl.Location;
      }
      const savedUser = await user.save();
      console.log(savedUser);
      res.status(200).json({ message: "Signup successful", data: filterUser(savedUser) });
  } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Error: " + error.message });
  }
});

authRouter.post("/login", async (req: AuthenticatedRequest, res: Response) => {
  try {
    if(req.user){
        const filteredUser = filterUser(req.user);
        res.status(200).json({ message: "Already Logged In", data: filteredUser });
        return;
    }
      const { email, password, location } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
          throw new Error("Invalid Credentials");
      }
      const isPasswordValid = await user.validatePassword(password);
      if (isPasswordValid) {
          req.session.userId = user._id;

          if (location) {
              user.location = {
                  type: "Point",
                  coordinates: [
                      parseFloat(location.longitude),
                      parseFloat(location.latitude)
                  ]
              };
              req.session.location = user.location;
              await user.save();
          }
          const filteredUser = filterUser(user);
          res.status(200).json({ message: "Login Successful", data: filteredUser });
      } else {
          throw new Error("Invalid Credentials");
      }
  } catch (error) {
      console.log(error);
      res.status(400).json({ message: "ERROR: " + error.message });
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

authRouter.get("/check-auth", checkAuth, async (req: AuthenticatedRequest, res: Response) => {
    if (req.user) {
        const filteredUser = filterUser(req.user);

        res.status(200).json({ message: "Authenticated", data: filteredUser });
      }else{
      res.status(400).json({ message: "Not Authenticated" });}
});