import { Session } from "express-session";
import User from "../models/user.js";
import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  session: Session & {
    userId?: string;
  };
  user?: typeof User;
}