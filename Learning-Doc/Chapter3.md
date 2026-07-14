# 📖 Chapter 3 – Building the Three Node.js Microservices

> **Series:** Building Production-Ready Node.js Microservices using Docker, Kubernetes, Helm & CI/CD

---

# 📚 Chapter Overview

In the previous chapter, we prepared our development environment. In this chapter, we'll build the three Node.js microservices that form the foundation of our application.

By the end of this chapter, you will have:

- ✅ Three independent Express.js applications
- ✅ A consistent folder structure across all services
- ✅ Health Check endpoints
- ✅ Environment variable support
- ✅ MongoDB Atlas connectivity
- ✅ Basic REST APIs
- ✅ A scalable project structure ready for Docker and Kubernetes

---

# 🏗 Final Project Architecture

```text
Microservice-Docker-Kubernetes
│
├── auth-service
├── user-service
├── product-service
├── k8s
├── helm
└── .github
```

Each service is developed independently and can be deployed, scaled, and maintained separately.

---

# 🚀 Step 1 – Create the Project

Create the root project directory:

```bash
mkdir Microservice-Docker-Kubernetes
cd Microservice-Docker-Kubernetes
```

Create the project folders:

```bash
mkdir auth-service
mkdir user-service
mkdir product-service
mkdir k8s
mkdir helm
mkdir .github
```

Verify the structure:

```text
Microservice-Docker-Kubernetes
│
├── auth-service
├── user-service
├── product-service
├── k8s
├── helm
└── .github
```

---

# 🔐 Step 2 – Initialize the Auth Service

Navigate to the Auth Service:

```bash
cd auth-service
```

Initialize a Node.js project:

```bash
npm init -y
```

Install dependencies:

```bash
npm install express mongoose dotenv jsonwebtoken
```

Install Nodemon for development:

```bash
npm install --save-dev nodemon
```

---

# ⚙️ Step 3 – Update `package.json`

Replace the `scripts` section with:

```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

---

# 📂 Step 4 – Create the Folder Structure

Inside `auth-service`, create the following structure:

```text
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
│   └── db.js
│
├── middleware
│   └── authMiddleware.js
│
├── models
│
├── routes
│   └── authRoutes.js
│
└── controllers
    └── authController.js
```

> **Note:** We won't implement every folder immediately, but creating the structure now keeps the project organized and scalable.

---

# 🔑 Step 5 – Create `index.js` (Auth Service)

```javascript
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
```

---

# 🔒 Step 6 – Create `.env`

```env
PORT=3000

MONGO_URI=<Your MongoDB Atlas Connection String>

JWT_SECRET=mysecretkey
```

> **Important:** Never commit `.env` files to Git.

---

# 🚫 Step 7 – Create `.gitignore`

```gitignore
node_modules/
.env
```

This prevents dependencies and sensitive information from being committed.

---

# ✅ Step 8 – Test the Auth Service

Start the service:

```bash
npm start
```

Expected output:

```text
Connected to MongoDB Atlas

Auth Service Started on Port 3000
```

### Test API

```http
GET http://localhost:3000/auth
```

Response:

```text
Auth Service Running
```

### Health Check

```http
GET http://localhost:3000/health
```

Response:

```json
{
  "service": "Auth Service",
  "status": "UP"
}
```

---

# 👤 Step 9 – Create the User Service

Return to the project root:

```bash
cd ..
cd user-service
```

Initialize the project:

```bash
npm init -y
```

Install dependencies:

```bash
npm install express mongoose dotenv jsonwebtoken
```

---

# 👥 Step 10 – Create `index.js` (User Service)

```javascript
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
```

---

# 🔒 Step 11 – Create User `.env`

```env
PORT=3001

MONGO_URI=<Your MongoDB Atlas Connection String>

JWT_SECRET=mysecretkey
```

---

# ✅ Step 12 – Test the User Service

Run:

```bash
npm start
```

Test endpoint:

```http
GET http://localhost:3001/user
```

Response:

```text
User Service Running
```

---

# 📦 Step 13 – Create the Product Service

Navigate to the Product Service:

```bash
cd ..
cd product-service
```

Initialize:

```bash
npm init -y
```

Install dependencies:

```bash
npm install express mongoose dotenv jsonwebtoken
```

---

# 🛒 Step 14 – Create `index.js` (Product Service)

```javascript
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
    console.log("Product Service Started on Port 3002");
});
```

---

# 🔒 Step 15 – Create Product `.env`

```env
PORT=3002

MONGO_URI=<Your MongoDB Atlas Connection String>

JWT_SECRET=mysecretkey
```

---

# ✅ Step 16 – Test the Product Service

Run:

```bash
npm start
```

Test endpoint:

```http
GET http://localhost:3002/product
```

Response:

```text
Product Service Running
```

---

# 📁 Step 17 – Common Project Structure

After completing all three services, your project should look like this:

```text
Microservice-Docker-Kubernetes
│
├── auth-service
│   ├── index.js
│   ├── package.json
│   ├── .env
│   └── Dockerfile (Next Chapter)
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
```

---

# ⚠️ Step 18 – Common Issues

## Issue 1 – `MONGO_URI` is Undefined

Error:

```text
MongooseError:
The 'uri' parameter to openUri() must be a string, got "undefined"
```

### Cause

- `.env` file is missing
- `dotenv` is not loaded
- `MONGO_URI` is not defined

### Solution

Install `dotenv`:

```bash
npm install dotenv
```

Load environment variables:

```javascript
require("dotenv").config();
```

Verify:

```javascript
console.log(process.env.MONGO_URI);
```

---

## Issue 2 – MongoDB Atlas Connection Failed

Possible causes:

- Incorrect username or password
- IP address not whitelisted
- Invalid connection string

### Verify in MongoDB Atlas

- Database user exists
- Network Access allows your IP (or `0.0.0.0/0` for development)
- Connection string is correct

---

## Issue 3 – Port Already in Use

Example:

```text
Error: listen EADDRINUSE: address already in use :::3000
```

### Solution

- Stop the process using the port, or
- Change the `PORT` value in the `.env` file.

---

# 💡 Best Practices

- Use environment variables for configuration.
- Never commit `.env` files.
- Add `node_modules/` to `.gitignore`.
- Keep each service independent.
- Always expose a `/health` endpoint.
- Use a consistent folder structure across services.
- Log startup and database connection messages clearly.

---

# ✅ Verify Before Moving On

You should now have:

- ✅ Three independent Node.js services
- ✅ Express.js installed
- ✅ Mongoose configured
- ✅ MongoDB Atlas connection support
- ✅ Environment variables
- ✅ Health Check endpoints
- ✅ Project structure ready for Docker and Kubernetes

### Test All APIs

```text
http://localhost:3000/auth
http://localhost:3001/user
http://localhost:3002/product

http://localhost:3000/health
http://localhost:3001/health
http://localhost:3002/health
```

All endpoints should return successful responses.

---

# 📚 Chapter Summary

In this chapter, we built the three core microservices that power our application.

Each service:

- Runs independently
- Uses Express.js
- Connects to MongoDB Atlas using environment variables
- Exposes REST API endpoints
- Includes a Health Check endpoint
- Follows a scalable and consistent folder structure

We also explored common setup issues such as missing environment variables, MongoDB Atlas connection failures, and port conflicts.

---

# 🚀 What's Next?

In **Chapter 4 – Dockerize the Microservices**, we will:

- Create Dockerfiles for each service
- Build Docker images
- Run containers locally
- Publish images to Docker Hub
- Prepare our applications for deployment to Kubernetes

This is where we'll transition from local development to a fully containerized, production-style environment.

---

## 📌 End of Chapter 3

You have successfully built the foundation of your production-ready Node.js microservices application. The next step is to package each service into Docker containers and prepare them for orchestration with Kubernetes.