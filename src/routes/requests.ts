import express, { Request, Response } from "express";
import { userAuth } from "../middlewares/auth.js";

export const requestsRouter = express.Router();

requestsRouter.post("/sendConnectionRequest", userAuth, async (req: Request, res: Response) => {
  res.send("Connection Request sent");
});
