require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = express();

app.use(express.json());
console.log("MONGO URL", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.log(err));

app.get("/auth", (req, res) => {
    res.send("Auth Service Running");
});

app.get("/health", (req, res) => {
    res.status(200).json({
        service: "Auth Service",
        status: "UP"
    });
});
app.post("/login", (req, res) => {

    const { username, password } = req.body;

    if (
        username === "admin" &&
        password === "password123"
    ) {

        const token = jwt.sign(
            {
                username: username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        return res.json({
            token
        });
    }

    res.status(401).json({
        message: "Invalid Credentials"
    });

});

app.listen(3000, () => {
    console.log("Auth Service Started on Port 3000");
});
