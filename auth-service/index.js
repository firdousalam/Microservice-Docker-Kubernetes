const express = require("express");
require("dotenv").config();
const app = express();

app.get("/", (req, res) => {
    res.send("Auth Service");
});
app.get("/auth", (req, res) => {
    res.send("Auth Service");
});
app.listen(3000, () => {
    console.log("Auth running");
});