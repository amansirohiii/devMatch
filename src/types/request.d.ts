import { Session } from "express-session";
import User from "../models/user.js";
import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  session: Session & {
    userId?: string;
    location?: {

      type: string;

      coordinates: [number, number];

    };
  };
  user?:  InstanceType<typeof User>;

}