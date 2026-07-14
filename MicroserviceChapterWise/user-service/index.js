require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.log(err));

app.get("/user", (req, res) => {
    res.send("User Service Running");
});

app.get("/health", (req, res) => {
    res.status(200).json({
        service: "User Service",
        status: "UP"
    });
});

app.listen(3001, () => {
    console.log("User Service Started on Port 3001");
});