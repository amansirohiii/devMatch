import express, { Response } from "express";
import { userAuth } from "../middlewares/auth.js";
import { AuthenticatedRequest } from "../types/request.d.js";
import ConnectionRequest from "../models/connectionRequest.js";
export const userRouter = express.Router();

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

userRouter.get(
    "/requests",
    userAuth,
    async (req: AuthenticatedRequest, res) => {
        try {
            const user = req.user;

            const connectionRequests = await ConnectionRequest.find({
                toUserId: user._id,
                status: "interested",
            }).populate("fromUserId", USER_SAFE_DATA);
            res.status(200).json({
                message: "Success",
                data: connectionRequests,
            });
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: "ERROR: " + error.message });
        }
    }
);

userRouter.get(
    "/connections",
    userAuth,
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const user = req.user;
            const connectionRequests = await ConnectionRequest.find({
                status: "accepted",
                $or: [
                    {
                        toUserId: user._id,
                    },
                    {
                        fromUserId: user._id,
                    },
                ],
            }).populate("fromUserId", USER_SAFE_DATA).populate("toUserId", USER_SAFE_DATA);
            const connections = connectionRequests.map((row) => {
                if(row.fromUserId._id.equals(user.
                  _id)){
                    return row.toUserId;
                  }
                return row.fromUserId;
            });
            res.status(200).json({ message: "Success", data: connections });
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: "ERROR: " + error.message });
        }
    }
);
