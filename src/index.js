import express from "express";
import { dbConnect } from "./config/dbConnect.js";
import dotenv from "dotenv";
import User from "./models/user.js";
import { validateSignUpData } from "./utils/validation.js";
import bcrypt from "bcrypt";
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

app.post("/login", async(req, res)=>{
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            throw new Error("Invalid Credentials");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(isPasswordValid){
            res.send("Login Successful");
        }
        else{
            throw new Error("Invalid Credentials");
        }
    } catch (error) {
        console.log(error);
        res.status(400).send("ERROR: " + error.message);
    }
})

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
