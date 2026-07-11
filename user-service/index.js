const express = require("express");
const axios = require("axios");

const app = express();

app.get("/", (req, res) => {
    res.send("User Service");
});

app.get("/details", async (req, res) => {

    const auth = await axios.get("http://auth-service:3000");

    const product = await axios.get("http://product-service:3002");

    res.json({
        auth: auth.data,
        product: product.data
    });

});

app.listen(3001);