import express, { Request, Response } from "express";
import { userAuth } from "../middlewares/auth.js";
import { AuthenticatedRequest } from "../types/request";
import { validateEditProfileData } from "../utils/validation.js";
import { hashPassword } from "../utils/hashPassword.js";
import { upload, uploadImage } from "../utils/uploadImage.js";
import { filterUser } from "../utils/filterUser.js";

export const profileRouter = express.Router();

profileRouter.get("/", userAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
      const user = req.user;
      const filteredUser = filterUser(user);
      res.json(filteredUser);
  } catch (error) {
      console.error(error);
      res.status(400).json({message: "ERROR: " + error.message});
  }
});

profileRouter.patch("/", userAuth, upload.single("image"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if(!validateEditProfileData(req)){
      throw new Error("Invalid Data");
    }
    if(req.body.password){
      const hashedPassword = hashPassword(req.body.password);
      req.body.password = hashedPassword;
    }
    if(req.file){
      const fileUrl = await uploadImage({file: req.file, user: req.user});
      req.body.photoUrl = fileUrl.Location;
    }
    const currentUser = req.user as { [key: string]: any };
    Object.keys(req.body).forEach((key) => (currentUser[key] = req.body[key]));
    await currentUser.save();
    const filteredUser = filterUser(currentUser);
    res.status(200).json({
      message: `${currentUser.firstName}, your profile updated successfully`,
      data: filteredUser,
    });

  } catch (error) {
    console.error(error);
    res.status(400).json({message: "ERROR: " + error.message});
  }
});

