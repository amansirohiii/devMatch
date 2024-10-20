import express, { Request, Response } from "express";
import { userAuth } from "../middlewares/auth.js";
import { AuthenticatedRequest } from "../types/request.js";
import User from "../models/user.js";
import ConnectionRequest from "../models/connectionRequest.js";

export const requestsRouter = express.Router();

requestsRouter.post("/:status/:toUserId", userAuth,
    async (req: AuthenticatedRequest, res: Response): Promise<any> => {
        try {
          const fromUserId = req.session.userId;
            const toUserId = req.params.toUserId;
            const status = req.params.status;

            // Check if the status is valid
          const allowedStatus = ["ignored", "interested"];
          if(!allowedStatus.includes(status)){
            return res.status(400).json({message: "Invalid status" + status});
          }
                    if (fromUserId === toUserId) {
            throw new Error("You cannot send a connection request to yourself");
        }

        const toUser = await User.findById(toUserId);
        const fromUser = await User.findById(fromUserId);
        if (!toUser) {
            throw new Error("User not found");
        }

          // Check if the connection request exists
          const existingConnectionRequest = await ConnectionRequest.findOne({
            $or:[
              {fromUserId, toUserId},
              {fromUserId: toUserId, toUserId: fromUserId}
            ]
          });
          if(existingConnectionRequest){
            return res.status(400).json({message: "Connection request already exists"});
          }


            if (fromUser.connections.includes(toUserId) || toUser.connections.includes(fromUserId)) {
                throw new Error("You are already connected with this user");
            }

            const data = await ConnectionRequest.create({ fromUserId, toUserId, status });
            res.status(200).json({ message: toUser.firstName + " " + status , data});

        } catch (error) {
            console.error(error);
            res.status(400).json({message: "ERROR: " + error.message});
        }
    }
);
