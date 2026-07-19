const express = require("express");
require("dotenv").config();
const app = express();

const mongoose = require("mongoose");
console.log("COON", process.env.MONGO_URI)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch((err) => console.error("MongoDB connection failed:", err));

app.get("/product", (req, res) => {
    res.send("Product Service");
});
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        service: "Product Service"
    });
});

app.listen(3002, () => {
    console.log("Product running");
});