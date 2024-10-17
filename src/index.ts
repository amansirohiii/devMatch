import express from "express";
import { dbConnect } from "./config/dbConnect.js";
import dotenv from "dotenv";
import User from "./models/user";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import { authRouter } from "./routes/auth.js";
import { profileRouter } from "./routes/profile.js";
import { requestsRouter } from "./routes/requests.js";
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
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
        cookie: {
            secure: true,
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24,
          },
    })
);
await dbConnect();

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestsRouter);

app.get("/", (req, res) => {
    res.send("Hello World");
});


app.get("/feed", async (req, res) => {
    try {
        const data = await User.find();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(400).send("signup failed");
    }
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Server is running on port", port);
});
