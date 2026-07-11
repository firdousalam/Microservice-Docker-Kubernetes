const express = require("express");
const axios = require("axios");
const app = express();

app.get("/", (req, res) => {
    res.send("User Service");
});



// app.get("/user", async (req, res) => {

//     //This is Kubernetes Service Name.
//     const response = await axios.get("http://auth-service:3000");

//     res.send({
//         user: "John",
//         auth: response.data
//     });

// });

app.listen(3001, () => {
    console.log("User running");
});