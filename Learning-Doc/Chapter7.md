Chapter 7 – MongoDB Atlas, ConfigMaps & Secrets
Building Production-Ready Node.js Microservices using Docker, Kubernetes, Helm & CI/CD
Chapter Overview

So far, our microservices are running successfully inside Kubernetes and are accessible through the NGINX Ingress Controller.

However, our applications still require configuration such as:

MongoDB Atlas Connection String
JWT Secret
Environment variables
Database name

Hardcoding these values inside the application or Docker image is not a good practice.

In this chapter, we'll learn how to securely manage application configuration using Kubernetes ConfigMaps and Secrets, and connect all three services to MongoDB Atlas.

By the end of this chapter, you'll have:

A MongoDB Atlas database
Kubernetes ConfigMap
Kubernetes Secret
Environment variables injected into Pods
All services connected to MongoDB Atlas
Production-ready configuration management
Why Use ConfigMaps and Secrets?

Consider this code:

mongoose.connect(
  "mongodb+srv://admin:password123@cluster.mongodb.net/microservice"
);

Problems:

Password is visible in source code
Credentials are stored in Git
Every environment requires code changes
Not secure

Instead, use:

mongoose.connect(process.env.MONGO_URI);

The application reads configuration from environment variables, while Kubernetes supplies the values.

Configuration Flow
Developer
      │
      ▼
Kubernetes Secret
      │
      ▼
Environment Variable
      │
      ▼
Node.js Application
      │
      ▼
MongoDB Atlas
Step 1 – Create a MongoDB Atlas Cluster
Sign in to MongoDB Atlas.
Create a free M0 cluster.
Create a database user.
Whitelist your IP address (or use 0.0.0.0/0 for development only).
Click Connect → Drivers.
Copy the connection string.

Example:

mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/microservices

Replace:

username
password
microservices

with your own values.

Step 2 – Update the Node.js Code

All three services should use:

require("dotenv").config();

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Connected to MongoDB Atlas"))
.catch(err => console.error(err));

Do not hardcode the connection string.

Step 3 – Local Development with .env

Example:

PORT=3002

MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/microservices

JWT_SECRET=mySecretKey

Run:

npm start

Expected:

Connected to MongoDB Atlas
Issue We Faced

During development, the application printed:

COON undefined

Then:

MongooseError:

The 'uri' parameter to openUri() must be a string

got "undefined"
Cause

process.env.MONGO_URI was undefined because:

.env file was missing
dotenv wasn't loaded
MONGO_URI wasn't defined
Solution

Install:

npm install dotenv

At the top of index.js:

require("dotenv").config();

Verify:

console.log(process.env.MONGO_URI);

If the URI prints correctly, MongoDB should connect successfully.

Step 4 – Create a ConfigMap

ConfigMaps store non-sensitive configuration such as ports and environment names.

Create:

k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap

metadata:
  name: microservice-config

data:
  NODE_ENV: production

Apply it:

kubectl apply -f configmap.yaml

Verify:

kubectl get configmap

Describe:

kubectl describe configmap microservice-config
Step 5 – Create a Secret

Secrets store sensitive information.

Create:

k8s/secret.yaml
Option 1 – Using stringData (Recommended)
apiVersion: v1
kind: Secret

metadata:
  name: microservice-secret

type: Opaque

stringData:
  MONGO_URI: mongodb+srv://username:password@cluster.mongodb.net/microservices

  JWT_SECRET: mySecretKey

Apply:

kubectl apply -f secret.yaml

Verify:

kubectl get secrets

Describe:

kubectl describe secret microservice-secret

Note: kubectl describe does not display secret values.

Option 2 – Create the Secret from the Command Line
kubectl create secret generic microservice-secret \
  --from-literal=MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/microservices" \
  --from-literal=JWT_SECRET="mySecretKey"
Step 6 – Use the Secret in a Deployment

Update each Deployment YAML.

Example (auth-deployment.yaml):

containers:

- name: auth

  image: firdousalam2058/auth-service:v3

  ports:
    - containerPort: 3000

  env:

    - name: MONGO_URI
      valueFrom:
        secretKeyRef:
          name: microservice-secret
          key: MONGO_URI

    - name: JWT_SECRET
      valueFrom:
        secretKeyRef:
          name: microservice-secret
          key: JWT_SECRET

    - name: NODE_ENV
      valueFrom:
        configMapKeyRef:
          name: microservice-config
          key: NODE_ENV

Repeat the same for:

user-deployment.yaml
product-deployment.yaml
Step 7 – Apply the Changes
kubectl apply -f configmap.yaml

kubectl apply -f secret.yaml

kubectl apply -f auth-deployment.yaml

kubectl apply -f user-deployment.yaml

kubectl apply -f product-deployment.yaml
Step 8 – Restart the Deployments
kubectl rollout restart deployment auth-deployment

kubectl rollout restart deployment user-deployment

kubectl rollout restart deployment product-deployment
Step 9 – Verify the Pods
kubectl get pods

All Pods should eventually show:

Running
Step 10 – Verify the Environment Variables

Find a Pod:

kubectl get pods

Open a shell:

kubectl exec -it auth-deployment-xxxxx -- sh

Inside the container:

printenv

Or check a specific variable:

echo $MONGO_URI

echo $JWT_SECRET

echo $NODE_ENV

You should see the values injected by Kubernetes.

Step 11 – Verify MongoDB Connectivity

Check the application logs:

kubectl logs auth-deployment-xxxxx

Expected:

Connected to MongoDB Atlas

Repeat for:

kubectl logs user-deployment-xxxxx

kubectl logs product-deployment-xxxxx
Step 12 – Create a Sample Collection

Insert a document into MongoDB Atlas.

Example:

{
  "name": "Laptop",
  "price": 85000
}

Verify that the collection appears in Atlas.

This confirms your application is successfully connected to the database.

Folder Structure
Microservice-Docker-Kubernetes

├── auth-service
├── user-service
├── product-service
│
├── k8s
│
│   ├── auth-deployment.yaml
│   ├── user-deployment.yaml
│   ├── product-deployment.yaml
│
│   ├── auth-service.yaml
│   ├── user-service.yaml
│   ├── product-service.yaml
│
│   ├── configmap.yaml
│   ├── secret.yaml
│   └── ingress.yaml
│
└── helm
Common Commands

Create ConfigMap:

kubectl apply -f configmap.yaml

Create Secret:

kubectl apply -f secret.yaml

View ConfigMaps:

kubectl get configmap

View Secrets:

kubectl get secrets

Describe ConfigMap:

kubectl describe configmap microservice-config

Describe Secret:

kubectl describe secret microservice-secret

Restart Deployments:

kubectl rollout restart deployment auth-deployment

kubectl rollout restart deployment user-deployment

kubectl rollout restart deployment product-deployment

View Logs:

kubectl logs <pod-name>
Common Issues We Solved
1. MONGO_URI Undefined

Error:

COON undefined

Cause:

.env missing
dotenv not loaded
Environment variable not injected

Solution:

Add require("dotenv").config();
Verify the .env file for local development
Ensure the Secret is referenced correctly in the Deployment for Kubernetes
2. MongoDB Connection Failed

Error:

MongoDB connection failed

Possible causes:

Incorrect username or password
IP address not whitelisted
Invalid connection string
Secret contains incorrect values

Verify your MongoDB Atlas configuration and recreate the Secret if necessary.

3. Secret Not Updated

Updating a Secret does not automatically restart running Pods.

Solution:

kubectl rollout restart deployment auth-deployment

kubectl rollout restart deployment user-deployment

kubectl rollout restart deployment product-deployment
4. Environment Variable Missing Inside the Container

Verify the Secret exists:

kubectl get secret

Check the Deployment:

kubectl describe deployment auth-deployment

Ensure the env section correctly references the Secret and ConfigMap keys.

Best Practices
Store passwords, API keys, and JWT secrets in Secrets.
Store non-sensitive configuration in ConfigMaps.
Never commit .env files or Secret YAML files containing real credentials to Git.
Use the same environment variable names across all services for consistency.
Restart Deployments after updating Secrets or ConfigMaps.
Test MongoDB connectivity locally before deploying to Kubernetes.
Verify Before Moving On

Before continuing, ensure:

✅ MongoDB Atlas cluster is running.
✅ All three services connect successfully to MongoDB Atlas.
✅ ConfigMap is created.
✅ Secret is created.
✅ Environment variables are injected into the Pods.
✅ Application logs show Connected to MongoDB Atlas.
✅ Sensitive credentials are no longer hardcoded in the application.
Chapter Summary

In this chapter, we connected the Auth, User, and Product microservices to MongoDB Atlas and learned how to manage configuration securely using Kubernetes ConfigMaps and Secrets. We replaced hardcoded values with environment variables, injected them into the Pods, and documented the real-world issues encountered during development—such as MONGO_URI being undefined and MongoDB connection failures—along with their solutions.

What's Next?

In Chapter 8 – JWT Authentication & Service-to-Service Security, we'll implement secure authentication using JSON Web Tokens (JWT). The Auth Service will generate signed tokens, the User Service will validate them through middleware, and protected routes will only be accessible to authenticated users, providing a production-ready authentication flow for our microservices.