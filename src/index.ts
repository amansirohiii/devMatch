import express from "express";
import { dbConnect } from "./config/dbConnect.js";
import dotenv from "dotenv";
import session from "express-session";
import MongoStore from "connect-mongo";
import { authRouter } from "./routes/auth.js";
import { profileRouter } from "./routes/profile.js";
import { requestsRouter } from "./routes/requests.js";
import cors from "cors";
import { userRouter } from "./routes/user.js";
dotenv.config();
import http from "http";
import { Server } from "socket.io";
import SocketUsers from "./models/socketUsers.js";


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [process.env.NODE_ENV === "production" ? "https://dev-match-web.vercel.app" : "http://localhost:5173"], // Replace with your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
})
app.set("io", io);

io.on("connection", (socket: any) => {
    console.log("A user connected with socket ID:", socket.id);

    // Register userId with their socketId in the database
    socket.on("register", async (userId: string) => {
      try {
        // Check if the user already exists in the SocketUsers collection
        const existingUser = await SocketUsers.findOne({ userId });

        if (existingUser) {
          // Update the socketId if the user is already registered
          existingUser.socketId = socket.id;
          await existingUser.save();
        } else {
          // Create a new entry if the user is not registered
          await SocketUsers.create({ userId, socketId: socket.id });
        }

        console.log(`User ${userId} registered with socket ID ${socket.id}`);
      } catch (error) {
        console.error("Error registering socket user:", error);
      }
    });

    // Handle user disconnection
    socket.on("disconnect", async () => {
      try {
        // Find and remove the socket user from the database
        const user = await SocketUsers.findOneAndDelete({ socketId: socket.id });

        if (user) {
          console.log(`User ${user.userId} disconnected and removed from SocketUsers`);
        } else {
          console.log(`No user found for socket ID ${socket.id}`);
        }
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    });
  });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(cors({
    origin: [process.env.NODE_ENV === "production" ? "https://dev-match-web.vercel.app" : "http://localhost:5173"],
    credentials: true,
}));
app.use(
    session({
        secret: process.env.SESSION_SECRET as string,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI as string,
            // mongooseConnection: mongoose.connection,
            ttl: 24 * 60 * 60,
            autoRemove: 'native'
          }),
          proxy: true,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          },
    })
);
await dbConnect();

app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/request", requestsRouter);
app.use("/user", userRouter);
app.get("/", (req, res) => {
    res.json({message: "Hello World"});
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log("Server is running on port", port);
});
