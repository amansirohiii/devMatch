import express from "express";
import { dbConnect } from "./config/dbConnect.js";
import dotenv from "dotenv";
import User from "./models/user.js";
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
await dbConnect();
app.get("/", (req, res) => {
    res.send("Hello World");
});
app.post("/signup", async (req, res) => {
    const { firstName, lastName, email, password, age, gender } = req.body;
    try {
        const user = new User({
            firstName,
            lastName,
            email,
            password,
            age,
            gender,
        });
        await user.save();
    } catch (error) {
        console.error(error);
        res.status(400).send("signup failed");
    }
    res.send("signup successful");
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
