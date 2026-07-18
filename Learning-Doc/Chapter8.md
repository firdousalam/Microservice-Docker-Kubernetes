# Chapter 8 – JWT Authentication & Service-to-Service Security

# Building Production-Ready Node.js Microservices using Docker, Kubernetes, Helm & CI/CD

---

# Table of Contents

- [Chapter Overview](#chapter-overview)
- [What is JWT?](#what-is-jwt)
- [Why Use JWT?](#why-use-jwt)
- [JWT Authentication Flow](#jwt-authentication-flow)
- [Step 1 – Install Required Packages](#step-1--install-required-packages)
- [Step 2 – Update the Auth Service](#step-2--update-the-auth-service)
- [Step 3 – Create a Login API](#step-3--create-a-login-api)
- [Step 4 – Add JWT Secret](#step-4--add-jwt-secret)
- [Step 5 – Test Login](#step-5--test-login)
- [Step 6 – Create JWT Middleware](#step-6--create-jwt-middleware)
- [Step 7 – Protect Routes](#step-7--protect-routes)
- [Step 8 – Test Without JWT](#step-8--test-without-jwt)
- [Step 9 – Test With JWT](#step-9--test-with-jwt)
- [Step 10 – Update Docker Images](#step-10--update-docker-images)
- [Step 11 – Verify Rollout](#step-11--verify-rollout)
- [Step 12 – Test the Complete Flow](#step-12--test-the-complete-flow)
- [Folder Structure](#folder-structure)
- [Kubernetes Configuration](#kubernetes-configuration)
- [Testing Using Postman](#testing-using-postman)
- [Common Issues](#common-issues)
- [Best Practices](#best-practices)
- [Verification Checklist](#verification-checklist)
- [Chapter Summary](#chapter-summary)

---

# Chapter Overview

In the previous chapters, we successfully built and deployed our Node.js microservices to Kubernetes.

Our application can now:

- ✅ Run inside Kubernetes
- ✅ Communicate using Kubernetes DNS
- ✅ Be accessed through NGINX Ingress
- ✅ Connect securely to MongoDB Atlas
- ✅ Use ConfigMaps and Secrets

Although the application is functional, **all APIs are currently public**. Anyone who knows the endpoint URL can access the services.

In a real production environment, APIs must be protected so that only authenticated users can access sensitive resources.

In this chapter, we'll implement **JWT (JSON Web Token)** authentication.

The **Auth Service** will authenticate users and generate a signed JWT, while the **User Service** (and later the Product Service) will validate the token before allowing access to protected APIs.

> **Note:** For simplicity, this chapter uses a hardcoded username and password. In a real-world application, credentials should be stored securely in a database with hashed passwords (using libraries such as `bcrypt`).

---

# What You Will Learn

By the end of this chapter, you'll be able to:

- Generate JWT tokens
- Validate JWT tokens
- Create authentication middleware
- Protect REST APIs
- Test secured APIs using Postman
- Secure communication between microservices

---

# What is JWT?

**JWT (JSON Web Token)** is an open standard (RFC 7519) used to securely transmit information between two parties as a digitally signed JSON object.

A JWT consists of three parts:

```text
Header.Payload.Signature
```

Example:

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiZmlyZG91cyJ9.
Kk8lT4sL...
```

The token is digitally signed using a secret key, allowing other services to verify that it hasn't been tampered with.

---

# Why Use JWT?

Without JWT:

```text
Browser
   │
   ▼
User Service
```

Anyone can directly access the API.

With JWT:

```text
Browser
   │
 Login
   │
   ▼
Auth Service
   │
Generate JWT
   │
   ▼
Browser
   │
Authorization: Bearer <token>
   │
   ▼
User Service
   │
Verify JWT
   │
   ▼
Protected Data
```

Only authenticated users receive a valid token and can access protected resources.

---

# JWT Authentication Flow

```text
                  Browser
                     │
     Login (username/password)
                     │
                     ▼
              Auth Service
                     │
          Validate Credentials
                     │
                     ▼
              Generate JWT
                     │
                     ▼
                JWT Token
                     │
Authorization: Bearer <token>
                     │
                     ▼
             User Service
                     │
             Verify JWT
                     │
          Token Valid?
          ┌──────────┴──────────┐
          │                     │
        Yes                    No
          │                     │
          ▼                     ▼
Protected Resource       401 Unauthorized
```

---

# Step 1 – Install Required Packages

Install JWT support in both services.

### Auth Service

```bash
npm install jsonwebtoken
```

### User Service

```bash
npm install jsonwebtoken
```

If Express isn't already installed:

```bash
npm install express
```

---

# Step 2 – Update the Auth Service

Enable JSON request parsing.

```javascript
const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());
```

---

# Step 3 – Create a Login API

Update the `Auth Service` with the following login endpoint.

```javascript
const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());

app.post("/login", (req, res) => {

    const { username, password } = req.body;

    if (
        username === "admin" &&
        password === "password123"
    ) {

        const token = jwt.sign(
            {
                username: username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        return res.json({
            token
        });
    }

    res.status(401).json({
        message: "Invalid Credentials"
    });

});

app.listen(3000, () => {
    console.log("Auth Service Running");
});
```

---

# Step 4 – Add JWT Secret

### Local Development

Create a `.env` file.

```env
JWT_SECRET=myVerySecretKey123
```

### Kubernetes

Store the secret in `secret.yaml`.

```yaml
stringData:

  JWT_SECRET: myVerySecretKey123
```

Apply the secret.

```bash
kubectl apply -f secret.yaml
```

Restart the deployment.

```bash
kubectl rollout restart deployment auth-deployment
```

---

# Step 5 – Test Login

Open **Postman**.

### Request

```http
POST http://localhost:8080/auth/login
```

### Headers

```text
Content-Type: application/json
```

### Body

```json
{
    "username":"admin",
    "password":"password123"
}
```

Expected response:

```json
{
    "token":"eyJhbGc..."
}
```

Copy the returned JWT token.

---

# Step 6 – Create JWT Middleware

Create:

```text
user-service/

└── middleware/
      auth.js
```

```javascript
const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {

    const header = req.header("Authorization");

    if (!header) {

        return res.status(401).json({
            message: "Token Missing"
        });

    }

    const token = header.replace("Bearer ", "");

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch(err) {

        return res.status(401).json({
            message: "Invalid Token"
        });

    }

}
```

---

# Step 7 – Protect Routes

Import the middleware.

```javascript
const authMiddleware = require("./middleware/auth");
```

### Public Route

```javascript
app.get("/", (req, res) => {
    res.send("User Service");
});
```

### Protected Route

```javascript
app.get(
    "/profile",
    authMiddleware,
    (req, res) => {

        res.json({
            message: "Welcome",
            user: req.user
        });

    }
);
```

Now only authenticated users can access `/profile`.

# index file will be something like this

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = express();

app.use(express.json());
console.log("MONGO URL", process.env.MONGO_URI);
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
app.post("/login", (req, res) => {

    const { username, password } = req.body;

    if (
        username === "admin" &&
        password === "password123"
    ) {

        const token = jwt.sign(
            {
                username: username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        return res.json({
            token
        });
    }

    res.status(401).json({
        message: "Invalid Credentials"
    });

});

app.listen(3000, () => {
    console.log("Auth Service Started on Port 3000");
});


#  ingress.yaml will be like this

apiVersion: networking.k8s.io/v1
kind: Ingress

metadata:
  name: microservice-ingress
  annotations:
    nginx.ingress.kubernetes.io/use-regex: "true"
    nginx.ingress.kubernetes.io/rewrite-target: /$2

spec:
  ingressClassName: nginx

  rules:
  - host: localhost
    http:
      paths:

      - path: /auth(/|$)(.*)
        pathType: ImplementationSpecific
        backend:
          service:
            name: auth-service
            port:
              number: 3000

      - path: /user(/|$)(.*)
        pathType: ImplementationSpecific
        backend:
          service:
            name: user-service
            port:
              number: 3001

      - path: /product(/|$)(.*)
        pathType: ImplementationSpecific
        backend:
          service:
            name: product-service
            port:
              number: 3002

---



# Step 8 – Test Without JWT

Request:

```http
GET http://localhost:8080/user/profile
```

Expected response:

```json
{
    "message":"Token Missing"
}
```

Status Code:

```text
401 Unauthorized
```

---

# Step 9 – Test With JWT

Add the header:

```text
Authorization

Bearer eyJhbGc...
```

Request:

```http
GET http://localhost:8080/user/profile
```

Expected response:

```json
{
  "message":"Welcome",
  "user":{
      "username":"admin",
      "iat":171234,
      "exp":171594
  }
}
```

---

# Step 10 – Update Docker Images

Rebuild the Auth Service.

```bash
docker build -t firdousalam2058/auth-service:v4 .
```

Push:

```bash
docker push firdousalam2058/auth-service:v4
```

Update the deployment image.

```yaml
image: firdousalam2058/auth-service:v4
```

Apply:

```bash
kubectl apply -f auth-deployment.yaml
```

Repeat the same process for the **User Service**.

---

# Step 11 – Verify Rollout

Monitor deployment rollout.

```bash
kubectl rollout status deployment auth-deployment
```

Check Pods.

```bash
kubectl get pods
```

Expected:

```text
Running
```

---

# Step 12 – Test the Complete Flow

Complete authentication flow:

1. Call `/auth/login`
2. Receive a JWT
3. Copy the token
4. Call `/user/profile`
5. Add:

```text
Authorization: Bearer <token>
```

6. Verify that the protected endpoint returns user information.

---

# Folder Structure

```text
auth-service/

│── index.js
│── package.json
│── Dockerfile
│── .env

user-service/

│── index.js
│── middleware
│      auth.js
│── package.json
│── Dockerfile
```

---

# Kubernetes Configuration

Ensure every deployment references the JWT Secret.

```yaml
env:

- name: JWT_SECRET

  valueFrom:

    secretKeyRef:

      name: microservice-secret

      key: JWT_SECRET
```

Restart the deployments.

```bash
kubectl rollout restart deployment auth-deployment

kubectl rollout restart deployment user-deployment
```

---

# Testing Using Postman

## Login

```http
POST /auth/login
```

Body:

```json
{
 "username":"admin",
 "password":"password123"
}
```

Copy the returned token.

---

## Protected Endpoint

```http
GET /user/profile
```

Headers:

```text
Authorization

Bearer <token>
```

Expected:

```text
200 OK
```

---

# Common Issues

## 1. jwt malformed

**Cause**

The token is incomplete or copied incorrectly.

**Solution**

Generate a new token and ensure the header is:

```text
Authorization

Bearer <token>
```

---

## 2. invalid signature

**Cause**

The Auth Service and User Service use different `JWT_SECRET` values.

**Solution**

Ensure both services reference the same Kubernetes Secret.

---

## 3. Token Missing

**Cause**

The Authorization header wasn't provided.

**Solution**

Include:

```text
Authorization

Bearer <token>
```

---

## 4. jwt expired

**Cause**

The token has expired.

```javascript
expiresIn: "1h"
```

**Solution**

Log in again to generate a new token.

---

## 5. Environment Variable Undefined

If:

```javascript
process.env.JWT_SECRET
```

is undefined, verify the environment variables.

```bash
kubectl exec -it <auth-pod> -- printenv
```

Ensure `JWT_SECRET` exists.

If not:

- Verify the Deployment references the Secret.
- Reapply the Secret.
- Restart the Deployment.

---

# Best Practices

- Store JWT secrets in Kubernetes Secrets
- Never hardcode secrets
- Use HTTPS in production
- Keep JWT expiration short
- Validate the token on every protected API
- Store hashed passwords using `bcrypt`
- Keep the JWT payload minimal

---

# Verification Checklist

Before moving to the next chapter, ensure:

- ✅ Auth Service generates JWT tokens
- ✅ JWT Secret is stored in Kubernetes Secrets
- ✅ User Service validates JWTs
- ✅ `/user/profile` is protected
- ✅ Requests without a token return **401 Unauthorized**
- ✅ Requests with a valid token return **200 OK**
- ✅ Updated Docker images are deployed successfully

---

# Chapter Summary

In this chapter, we implemented **JWT-based authentication** for our microservices.

The **Auth Service** authenticates users and generates signed JWTs, while the **User Service** validates those tokens before allowing access to protected APIs.

We also stored the JWT secret securely in Kubernetes Secrets and verified the complete authentication flow using Postman.

This authentication mechanism forms the foundation for securing communication between services and protecting APIs in production environments.

---

# Next Chapter

In **Chapter 9 – Health Checks, Readiness & Liveness Probes**, we'll make our application production-ready by adding `/health` endpoints to each service and configuring Kubernetes **readiness** and **liveness probes**.

These probes allow Kubernetes to automatically detect unhealthy containers, restart failed Pods, and ensure traffic is routed only to healthy instances.