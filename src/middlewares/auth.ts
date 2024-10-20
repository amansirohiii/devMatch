import { NextFunction, Request, Response } from "express";
import User from "../models/user.js";
import { AuthenticatedRequest } from "../types/request.js";

export const userAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Check if session contains userId
    if (!req.session.userId) {
      throw new Error("Not authenticated, please log in.");
    }

    // Find user by session-stored userId
    const user = await User.findById(req.session.userId);
    if (!user) {
      throw new Error("User not found.");
    }

    // Attach user object to the request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({message: "ERROR: " + error.message});
  }
};

export const checkAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    // Redirect to profile if user is already logged in
    return res.redirect("/profile");
  }
  next();
};
