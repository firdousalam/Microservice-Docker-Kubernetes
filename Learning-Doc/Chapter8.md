Chapter 8 – JWT Authentication & Service-to-Service Security
Building Production-Ready Node.js Microservices using Docker, Kubernetes, Helm & CI/CD
Chapter Overview

So far, our microservices can:

✅ Run inside Kubernetes
✅ Communicate using Kubernetes DNS
✅ Be accessed through NGINX Ingress
✅ Connect securely to MongoDB Atlas
✅ Use ConfigMaps and Secrets

However, anyone who knows the URL can still call the User and Product services. In a production environment, we must ensure that only authenticated users can access protected APIs.

This chapter introduces JSON Web Token (JWT) authentication. We'll build an Auth Service that validates user credentials and issues a signed JWT. The User Service (and later the Product Service) will verify this token before allowing access to protected resources.

Note: For learning purposes, we'll use a simple username/password check. In a real application, user credentials would be stored in a database with hashed passwords (for example, using bcrypt).

By the end of this chapter, you'll be able to:

Understand JWT architecture
Generate JWTs
Verify JWTs using middleware
Protect API endpoints
Test authentication using Postman
Secure microservice communication
What is JWT?

JWT (JSON Web Token) is an open standard for securely transmitting information between parties as a digitally signed JSON object.

A JWT contains three parts:

Header.Payload.Signature

Example:

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiZmlyZG91cyJ9.
Kk8lT4sL...
Why Use JWT?

Without JWT:

Browser
   │
   ▼
User Service

Anyone can access the API.

With JWT:

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
JWT Authentication Flow
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
Step 1 – Install Required Packages

In the Auth Service:

npm install jsonwebtoken

In the User Service:

npm install jsonwebtoken

If you're parsing JSON request bodies:

npm install express
Step 2 – Update the Auth Service

Install middleware:

const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());
Step 3 – Create a Login API

Replace your existing index.js with the following (or add the route):

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
Step 4 – Add JWT Secret

For local development:

.env

JWT_SECRET=myVerySecretKey123

For Kubernetes:

secret.yaml

stringData:

  JWT_SECRET: myVerySecretKey123

Apply:

kubectl apply -f secret.yaml

Restart:

kubectl rollout restart deployment auth-deployment
Step 5 – Test Login

Using Postman:

POST

http://localhost:8080/auth/login

Headers:

Content-Type

application/json

Body:

{
    "username":"admin",
    "password":"password123"
}

Expected response:

{
  "token":"eyJhbGc..."
}

Copy this token for the next steps.

Step 6 – Create JWT Middleware

Inside the User Service, create:

middleware/auth.js
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
Step 7 – Protect Routes

Update index.js

const authMiddleware = require("./middleware/auth");

Public route:

app.get("/", (req,res)=>{
    res.send("User Service");
});

Protected route:

app.get(

    "/profile",

    authMiddleware,

    (req,res)=>{

        res.json({

            message:"Welcome",

            user:req.user

        });

    }

);

Only authenticated users can access /profile.

Step 8 – Test Without JWT

Request:

GET

http://localhost:8080/user/profile

Expected:

{
    "message":"Token Missing"
}

HTTP Status:

401 Unauthorized
Step 9 – Test With JWT

Header:

Authorization

Bearer eyJhbGc...

Request:

GET

http://localhost:8080/user/profile

Expected:

{
  "message":"Welcome",
  "user":{
      "username":"admin",
      "iat":171234,
      "exp":171594
  }
}
Step 10 – Update Docker Image

Inside the Auth Service:

docker build -t firdousalam2058/auth-service:v4 .

Push:

docker push firdousalam2058/auth-service:v4

Update Deployment:

image: firdousalam2058/auth-service:v4

Apply:

kubectl apply -f auth-deployment.yaml

Repeat the same process for the User Service.

Step 11 – Verify Rollout
kubectl rollout status deployment auth-deployment

Check Pods:

kubectl get pods

All Pods should show:

Running
Step 12 – Test the Complete Flow
Call /auth/login
Receive a JWT.
Copy the token.
Call /user/profile.
Add the Authorization: Bearer <token> header.
Verify that the protected endpoint returns user information.
Folder Structure
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
Kubernetes Configuration

Ensure all Deployments include:

env:

- name: JWT_SECRET

  valueFrom:

    secretKeyRef:

      name: microservice-secret

      key: JWT_SECRET

Restart:

kubectl rollout restart deployment auth-deployment

kubectl rollout restart deployment user-deployment
Testing Using Postman
Login
POST

/auth/login

Body:

{
 "username":"admin",
 "password":"password123"
}

Copy the returned token.

Protected Endpoint
GET

/user/profile

Headers:

Authorization

Bearer <token>

Expected:

200 OK
Common Issues
1. jwt malformed

Cause:

The token is incomplete or copied incorrectly.

Solution:

Generate a new token and ensure the header is:

Authorization

Bearer <token>
2. invalid signature

Cause:

The Auth Service and User Service are using different JWT_SECRET values.

Solution:

Verify that all services reference the same Kubernetes Secret.

3. Token Missing

Cause:

The Authorization header was not sent.

Solution:

Add:

Authorization

Bearer <token>
4. jwt expired

Cause:

The token has expired (expiresIn: "1h").

Solution:

Log in again to receive a fresh token.

5. Environment Variable Undefined

If process.env.JWT_SECRET is undefined:

kubectl exec -it <auth-pod> -- printenv

Confirm that JWT_SECRET is present. If not, check the Deployment's env section and restart the Deployment after updating the Secret.

Best Practices
Never hardcode your JWT secret.
Store secrets in Kubernetes Secrets.
Always use HTTPS in production so tokens are encrypted in transit.
Set a reasonable token expiration time.
Validate the JWT on every protected endpoint.
Use password hashing (such as bcrypt) instead of storing plain-text passwords.
Include only the minimum required information in the JWT payload.
Verify Before Moving On

Before continuing, ensure:

✅ Auth Service issues a JWT.
✅ JWT Secret is stored in a Kubernetes Secret.
✅ User Service validates the JWT.
✅ /user/profile is protected.
✅ Requests without a token return 401 Unauthorized.
✅ Requests with a valid token return 200 OK.
✅ Updated Docker images are deployed successfully.
Chapter Summary

In this chapter, we implemented JWT-based authentication for our microservices. The Auth Service authenticates users and generates signed JWTs, while the User Service validates those tokens before granting access to protected APIs. We also stored the JWT secret securely in Kubernetes Secrets and verified the complete authentication flow using Postman.

What's Next?

In Chapter 9 – Health Checks, Readiness & Liveness Probes, we'll make our application production-ready by adding /health endpoints to each service and configuring Kubernetes readiness and liveness probes. This allows Kubernetes to automatically detect unhealthy containers, restart failed Pods, and route traffic only to healthy instances.