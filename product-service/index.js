const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("Product Service");
});

app.listen(3002, () => {
    console.log("Product running");
});