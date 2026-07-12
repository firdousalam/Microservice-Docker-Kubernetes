Chapter 3 – Building the Three Node.js Microservices
Building Production-Ready Node.js Microservices using Docker, Kubernetes, Helm & CI/CD
Chapter Overview

In the previous chapter, we prepared our development environment. In this chapter, we'll create the three Node.js microservices that form the foundation of our application.

By the end of this chapter, you will have:

Three independent Express.js applications
A consistent folder structure across all services
Health check endpoints
Environment variable support
MongoDB Atlas connectivity
Basic REST APIs
A scalable structure ready for Docker and Kubernetes
Final Architecture
Microservice-Docker-Kubernetes

├── auth-service
├── user-service
├── product-service
├── k8s
├── helm
└── .github

Each service will be developed independently.

Step 1 – Create the Project
mkdir Microservice-Docker-Kubernetes
cd Microservice-Docker-Kubernetes

Create the three services:

mkdir auth-service
mkdir user-service
mkdir product-service
mkdir k8s
mkdir helm
mkdir .github

Verify:

Microservice-Docker-Kubernetes
│
├── auth-service
├── user-service
├── product-service
├── k8s
├── helm
└── .github
Step 2 – Initialize the Auth Service

Move into the service:

cd auth-service

Initialize npm:

npm init -y

Install dependencies:

npm install express mongoose dotenv jsonwebtoken

Install development dependency:

npm install --save-dev nodemon
Step 3 – Update package.json

Replace the scripts section:

"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
Step 4 – Create the Folder Structure

Inside auth-service, create:

auth-service

│
├── index.js
├── package.json
├── package-lock.json
├── .env
├── .gitignore
├── Dockerfile
│
├── config
│     └── db.js
│
├── middleware
│     └── authMiddleware.js
│
├── models
│
├── routes
│     └── authRoutes.js
│
└── controllers
      └── authController.js

We won't implement every folder immediately, but creating the structure now makes the project easier to maintain.

Step 5 – Create index.js (Auth Service)
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

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

app.listen(3000, () => {
    console.log("Auth Service Started on Port 3000");
});
Step 6 – Create .env
PORT=3000

MONGO_URI=<Your MongoDB Atlas Connection String>

JWT_SECRET=mysecretkey

Do not commit .env to Git.

Step 7 – Create .gitignore
node_modules/
.env

This avoids committing dependencies and secrets.

Step 8 – Test the Auth Service

Run:

npm start

Expected output:

Connected to MongoDB Atlas

Auth Service Started on Port 3000

Test:

GET http://localhost:3000/auth

Response:

Auth Service Running

Health endpoint:

GET http://localhost:3000/health

Response:

{
  "service":"Auth Service",
  "status":"UP"
}
Step 9 – Create the User Service

Go back:

cd ..
cd user-service

Initialize:

npm init -y

Install:

npm install express mongoose dotenv jsonwebtoken
Step 10 – Create index.js (User Service)
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
    console.log("User Service Started");
});
Step 11 – Create User .env
PORT=3001

MONGO_URI=<Atlas Connection String>

JWT_SECRET=mysecretkey
Step 12 – Test User Service
npm start

Test:

GET

http://localhost:3001/user

Response:

User Service Running
Step 13 – Create Product Service
cd ..

cd product-service

Initialize:

npm init -y

Install:

npm install express mongoose dotenv jsonwebtoken
Step 14 – Create index.js (Product Service)
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Connected to MongoDB Atlas"))
.catch(err => console.log(err));

app.get("/product", (req, res) => {
    res.send("Product Service Running");
});

app.get("/health", (req, res) => {
    res.status(200).json({
        service: "Product Service",
        status: "UP"
    });
});

app.listen(3002, () => {
    console.log("Product Service Started");
});
Step 15 – Product .env
PORT=3002

MONGO_URI=<Atlas Connection String>

JWT_SECRET=mysecretkey
Step 16 – Test Product Service
npm start

Test:

GET

http://localhost:3002/product

Response:

Product Service Running
Step 17 – Common Project Structure

Your project should now look like this:

Microservice-Docker-Kubernetes

├── auth-service
│   ├── index.js
│   ├── package.json
│   ├── .env
│   └── Dockerfile (next chapter)
│
├── user-service
│   ├── index.js
│   ├── package.json
│   ├── .env
│   └── Dockerfile
│
├── product-service
│   ├── index.js
│   ├── package.json
│   ├── .env
│   └── Dockerfile
│
├── k8s
├── helm
└── .github
Step 18 – Common Issues (From Our Project)
Issue 1 – MONGO_URI is undefined

You encountered:

MongooseError:
The 'uri' parameter to openUri() must be a string, got "undefined"
Cause
.env file missing
dotenv not loaded
MONGO_URI not defined
Solution
Install dotenv:
npm install dotenv
Add to the top of index.js:
require("dotenv").config();
Verify:
console.log(process.env.MONGO_URI);
Issue 2 – MongoDB Atlas Connection Failed

Possible causes:

Incorrect username/password
IP address not whitelisted
Invalid connection string

Verify in MongoDB Atlas:

Database user exists
Network Access allows your IP (or 0.0.0.0/0 for development)
Connection string is copied correctly
Issue 3 – Port Already in Use

Example:

Error: listen EADDRINUSE: address already in use :::3000
Solution

Stop the process using the port or change the PORT value in .env.

Best Practices
Use environment variables for configuration.
Never commit .env files.
Add node_modules/ to .gitignore.
Keep each service independent.
Expose a /health endpoint from the start.
Use the same folder structure across services.
Log startup and database connection messages clearly.
Verify Before Moving On

You should now have:

✅ Three independent Node.js services
✅ Express installed
✅ Mongoose configured
✅ MongoDB Atlas connection support
✅ Environment variables
✅ Health endpoints
✅ Project structure ready for containerization

Test all services:

http://localhost:3000/auth
http://localhost:3001/user
http://localhost:3002/product
http://localhost:3000/health
http://localhost:3001/health
http://localhost:3002/health

All endpoints should return successful responses.

Chapter Summary

In this chapter, we built the three core microservices that power the application. Each service is independently structured, connected to MongoDB Atlas through environment variables, and exposes both a functional API endpoint and a health check endpoint. We also addressed common setup issues such as missing environment variables and MongoDB connection errors.

What's Next?

In Chapter 4 – Dockerize the Microservices, we'll create Dockerfiles for each service, build and run Docker images locally, publish them to Docker Hub, and prepare them for deployment to Kubernetes. This is where we'll begin moving from local development toward a containerized, production-style environment.