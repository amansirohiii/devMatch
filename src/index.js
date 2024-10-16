import express from "express";
import { dbConnect } from "./config/dbConnect.js";
import dotenv from "dotenv";
import User from "./models/user.js";
import { validateSignUpData } from "./utils/validation.js";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { checkAuthenticated, userAuth } from "./middlewares/auth.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            mongooseConnection: mongoose.connection,
            ttl: 24 * 60 * 60,
            autoRemove: 'native'
          }),
        cookie: {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24,
          },
    })
);
await dbConnect();
app.get("/", (req, res) => {
    res.send("Hello World");
});
app.post("/signup", async (req, res) => {
    const { firstName, lastName, email, password, age, gender } = req.body;
    try {
        validateSignUpData(req);
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            age,
            gender,
        });
        await user.save();
        res.send("signup successful");
    } catch (error) {
        console.error(error);
        res.status(400).send("Error: " + error.message);
    }
});

app.post("/login",checkAuthenticated, async (req, res) => {
    try {
        // if(req.cookies.token){
        //     res.send("hi")
        // }
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("Invalid Credentials");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            // res.cookie("token", token, {
            //     expires: new Date(Date.now() + 8 * 3600000),
            //   });
            req.session.userId = user._id;
            res.send("Login Successful");
        } else {
            throw new Error("Invalid Credentials");
        }
    } catch (error) {
        console.log(error);
        res.status(400).send("ERROR: " + error.message);
    }
});

app.get("/logout", async(req,res)=>{
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Failed to logout");
          }
          res.clearCookie("connect.sid");
          res.send("Logout Successful");
    });

})

app.get("/profile", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    } catch (error) {
        console.error(error);
        res.status(400).send("ERROR: " + error.message);
    }
});

app.post("/sendConnectionRequest", userAuth, async (req, res) => {
    res.send("Connection Request sent");
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
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
