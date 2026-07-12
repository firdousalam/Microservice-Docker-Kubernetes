const express = require("express");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/authMiddleware");
const app = express();

app.get("/", (req, res) => {
    res.send("Auth Service");
});
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        service: "Auth Service"
    });
});
app.get("/auth", (req, res) => {
    res.send("Auth Service");
});
app.get("auth/users", authMiddleware, (req, res) => {
    res.send(req.user)
});
// app.post("/register", async (req, res) => {

//     const { name, email, password } = req.body;

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = new User({

//         name,

//         email,

//         password: hashedPassword

//     });

//     await user.save();

//     res.json({

//         message: "User Registered"

//     });

// });


// app.post("/login", async (req, res) => {

//     const { email, password } = req.body;

//     const user = await User.findOne({ email });

//     if (!user) {

//         return res.status(401).json({

//             message: "Invalid Email"

//         });

//     }

//     const valid = await bcrypt.compare(password, user.password);

//     if (!valid) {

//         return res.status(401).json({

//             message: "Invalid Password"

//         });

//     }

//     const token = jwt.sign(

//         {

//             id: user._id,

//             email: user.email

//         },

//         process.env.JWT_SECRET,

//         {

//             expiresIn: "1h"

//         });

//     res.json({

//         token

//     });

// });



// app.get("/user",

//     authMiddleware,

//     (req, res) => {

//         res.json({

//             message: "User Details",

//             user: req.user

//         });

//     });
// app.get("/product",

//     authMiddleware,

//     (req, res) => {

//         res.json({

//             message: "Products",

//             user: req.user

//         });

//     });
app.listen(3000, () => {
    console.log("Auth running");
});