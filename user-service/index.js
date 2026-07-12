const express = require("express");
const axios = require("axios");
require("dotenv").config();
const app = express();

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch((err) => console.error("MongoDB connection failed:", err));

app.get("/user", (req, res) => {
    res.send("User Service");
});

app.get("/user/details", async (req, res) => {

    const auth = await axios.get("http://auth-service:3000");

    const product = await axios.get("http://product-service:3002");

    res.json({
        auth: auth.data,
        product: product.data
    });

});
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        service: "User Service"
    });
});
