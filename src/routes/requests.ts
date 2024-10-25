import express, { Response } from "express";
import { userAuth } from "../middlewares/auth.js";
import { AuthenticatedRequest } from "../types/request.js";
import User from "../models/user.js";
import ConnectionRequest from "../models/connectionRequest.js";
import { USER_SAFE_DATA } from "../utils/filterUser.js";
import SocketUsers from "../models/socketUsers.js";
export const requestsRouter = express.Router();


requestsRouter.post("/send/:sendStatus/:toUserId", userAuth,
    async (req: AuthenticatedRequest, res: Response): Promise<any> => {
        try {
          const fromUserId = req.session.userId;
            const toUserId = req.params.toUserId;
            const status = req.params.sendStatus;

if(!fromUserId || !toUserId || !status){
  return res.status(400).json({message: "Missing required fields"});
}
            // Check if the status is valid
          const allowedStatus = ["ignored", "interested"];
          if(!allowedStatus.includes(status)){
            return res.status(400).json({message: "Invalid status"});
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
            $or: [
              { fromUserId, toUserId },
              { fromUserId: toUserId, toUserId: fromUserId },
            ],
          });
          if(existingConnectionRequest){
            return res.status(400).json({message: "Connection request already exists "});
          }

            const data = await ConnectionRequest.create({ fromUserId, toUserId, status });
          res.status(200).json({ message: `${toUser.firstName} ${status}`, data });

            const populatedData = await ConnectionRequest.find({
              toUserId,
              status: "interested",
            }).populate("fromUserId", USER_SAFE_DATA).lean();

            const io = req.app.get("io");
            const socketUser = await SocketUsers.findOne({ userId: toUserId }).lean();

            if (socketUser?.socketId) {
              io.to(socketUser.socketId).emit("newRequest", populatedData);
              console.log(`Emitted newRequest to user ${toUserId} with socket ID ${socketUser.socketId}`);
            } else {
              console.log(`User ${toUserId} is not connected`);
            }


        } catch (error) {
            console.error(error);
            res.status(400).json({message: "ERROR: " + error.message});
        }
    }
);


requestsRouter.post("/review/:reviewStatus/:requestId", userAuth, async(req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const requestId = req.params.requestId;
    const reviewStatus = req.params.reviewStatus;
    const userId = req.session.userId;
    const allowedStatus = ["accepted", "rejected"];
    if(!allowedStatus.includes(reviewStatus)){
      return res.status(400).json({message: "Invalid status"});
    }
    const connectionRequest = await ConnectionRequest.findOne({_id: requestId, toUserId: userId, status: "interested"});
    if(!connectionRequest){
      return res.status(400).json({message: "Connection request not found"});
    }

    if(connectionRequest.status !== "interested"){
      return res.status(400).json({message: "You cannot review this request/ Already Reviewed"});
    }
    connectionRequest.status = reviewStatus;
    await connectionRequest.save();
    res.status(200).json({message: "Request reviewed successfully", data: connectionRequest});


    if(reviewStatus === "accepted"){
      const io = req.app.get("io");
    try {
      // Fetch the user's socket ID from the database using their userId
      const socketUser = await SocketUsers.findOne({ userId: connectionRequest.fromUserId });

      if (socketUser && socketUser.socketId) {
        const socketId = socketUser.socketId;
        const userId = connectionRequest.fromUserId;
        // Emit the event to the specific socketId
        io.to(socketId).emit("newConnection", connectionRequest);
        console.log(`Emitted newConnection to user ${userId} with socket ID ${socketId}`);
      } else {
        console.log(`User ${userId} is not connected`);
      }
    } catch (error) {
      console.error("Error fetching socket user:", error);
    }}
  } catch (error) {
    console.error(error);
    res.status(400).json({message: "ERROR: " + error.message});
  }

});