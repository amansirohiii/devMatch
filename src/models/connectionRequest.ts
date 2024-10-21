import mongoose from "mongoose";

const connectionRequestSchema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  status: {
    type: String,
    enum: {
      values: ["ignored", "interested", "accepted", "rejected"],
      message: `{VALUE} is not a valid status`,
    },
    required: true,
  },
}, {timestamps: true});

connectionRequestSchema.pre("save", function(next){
  // check if from and to user are same
  const connectionRequest = this;
  if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
    throw new Error("You cannot send a connection request to yourself");
  }
  next();
})

connectionRequestSchema.index({fromUserId: 1, toUserId: 1});

const ConnectionRequest = mongoose.models.ConnectionRequest || mongoose.model("ConnectionRequest", connectionRequestSchema);

export default ConnectionRequest;