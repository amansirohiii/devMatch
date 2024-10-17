import express, { Request, Response } from "express";
import { userAuth } from "../middlewares/auth.js";
import { AuthenticatedRequest } from "../types/request";

export const profileRouter = express.Router();

profileRouter.get("/profile", userAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
      const user = req.user;
      res.send(user);
  } catch (error) {
      console.error(error);
      res.status(400).send("ERROR: " + error.message);
  }
});

