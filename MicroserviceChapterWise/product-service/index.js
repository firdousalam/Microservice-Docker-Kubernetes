require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.log(err));

app.get("/product", (req, res) => {
    console.log(JSON.stringify({
        service: "Product Service",
        event: "Fetch Product",
        status: "SUCCESS",
        timestamp: new Date()
    }));
    res.send("Product Service Running");
});

app.get("/health", (req, res) => {
    res.status(200).json({
        service: "Product Service",
        status: "UP"
    });
});

app.listen(3002, () => {
    console.log("Product Service Started on Port 3002");
});