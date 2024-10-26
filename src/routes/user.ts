import express, { Response } from "express";
import { userAuth } from "../middlewares/auth.js";
import { AuthenticatedRequest } from "../types/request.js";
import ConnectionRequest from "../models/connectionRequest.js";
import User from "../models/user.js";
import mongoose from "mongoose";
import { USER_SAFE_DATA } from "../utils/filterUser.js";
export const userRouter = express.Router();



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
            })
                .populate("fromUserId", USER_SAFE_DATA)
                .populate("toUserId", USER_SAFE_DATA);
            const connections = connectionRequests.map((row) => {
                if (row.fromUserId._id.equals(user._id)) {
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

// userRouter.get("/feed", userAuth, async (req: AuthenticatedRequest, res: Response) => {
//     try {
//       const user = req.user;

//       const connectionRequests = await ConnectionRequest.find({
//         $or: [
//           {fromUserId: user._id},
//           {toUserId: user._id}
//         ]
//       }).select("fromUserId toUserId status");
//       const hideUserFromFeed = new Set();
//       connectionRequests.forEach((req)=>{
//         hideUserFromFeed.add(req.fromUserId.toString());
//         hideUserFromFeed.add(req.toUserId.toString());
//       });
//       const users = await User.find({
//         _id: { $nin: [...hideUserFromFeed, user._id] }
//       }).select(USER_SAFE_DATA);
//       res.status(200).json({message: "Success", data: users});

//     } catch (error) {
//         console.error(error);
//         res.status(400).json({ message: "ERROR: " + error.message });
//     }
// });

userRouter.get(
    "/feed",
    userAuth,
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const user = req.user;
            const page = parseInt(req.query.page as string) || 1;
            let limit = parseInt(req.query.limit as string) || 10;
            limit = limit > 30 ? 30 : limit;
            const skip = (page - 1) * limit;

            const connectionRequests = await ConnectionRequest.find({
                $or: [{ fromUserId: user._id }, { toUserId: user._id }],
            }).select("fromUserId toUserId status");

            const hideUsersFromFeed = new Set();
            connectionRequests.forEach((req) => {
                hideUsersFromFeed.add(req.fromUserId.toString());
                hideUsersFromFeed.add(req.toUserId.toString());
            });

            let users;
            if (user.location && user.location.coordinates) {
                users = await User.aggregate([
                    {
                        $geoNear: {
                            near: {
                                type: "Point",
                                coordinates: user.location.coordinates,
                            },
                            distanceField: "distance",
                            spherical: true,
                            query: {
                                $and: [
                                    { _id: { $nin: Array.from(hideUsersFromFeed).map(_id => new mongoose.Types.ObjectId(_id as string)) } },
                                    { _id: { $ne: user._id } },
                                  ],
                            },
                        },
                    },
                    {
                        $project: {
                            firstName: 1,
                            lastName: 1,
                            photoUrl: 1,
                            age: 1,
                            gender: 1,
                            about: 1,
                            skills: 1,
                            distance: 1,
                        },
                    },
                    {
                        $sort: { distance: 1 },
                    },
                    {
                        $skip: skip,
                    },
                    {
                        $limit: limit,
                    },
                ]);
            } else {
                users = await User.find({
                    $and: [
                        { _id: { $nin: Array.from(hideUsersFromFeed).map(_id => new mongoose.Types.ObjectId(_id as string)) } },
                        { _id: { $ne: user._id } },
                      ],               }).select(USER_SAFE_DATA);
            }
            const totalUsers = await User.countDocuments({
                _id: { $nin: [...hideUsersFromFeed, user._id] },
            });
            res.status(200).json({
                message: "Success",
                data: users,
                pagination: {
                    page,
                    limit,
                    totalPages: Math.ceil(totalUsers / limit),
                    totalUsers,
                },
            });
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: "ERROR: " + error.message });
        }
    }
);
