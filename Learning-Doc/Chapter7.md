# Chapter 7 – MongoDB Atlas, ConfigMaps & Secrets

# Building Production-Ready Node.js Microservices using Docker, Kubernetes, Helm & CI/CD

---

# Table of Contents

- [Chapter Overview](#chapter-overview)
- [Why Use ConfigMaps and Secrets?](#why-use-configmaps-and-secrets)
- [Configuration Flow](#configuration-flow)
- [Step 1 – Create a MongoDB Atlas Cluster](#step-1--create-a-mongodb-atlas-cluster)
- [Step 2 – Update the Node.js Code](#step-2--update-the-nodejs-code)
- [Step 3 – Local Development with .env](#step-3--local-development-with-env)
- [Issue We Faced](#issue-we-faced)
- [Step 4 – Create a ConfigMap](#step-4--create-a-configmap)
- [Step 5 – Create a Secret](#step-5--create-a-secret)
- [Step 6 – Use the Secret in a Deployment](#step-6--use-the-secret-in-a-deployment)
- [Step 7 – Apply the Changes](#step-7--apply-the-changes)
- [Step 8 – Restart the Deployments](#step-8--restart-the-deployments)
- [Step 9 – Verify the Pods](#step-9--verify-the-pods)
- [Step 10 – Verify Environment Variables](#step-10--verify-environment-variables)
- [Step 11 – Verify MongoDB Connectivity](#step-11--verify-mongodb-connectivity)
- [Step 12 – Create a Sample Collection](#step-12--create-a-sample-collection)
- [Folder Structure](#folder-structure)
- [Common Commands](#common-commands)
- [Common Issues We Solved](#common-issues-we-solved)
- [Best Practices](#best-practices)
- [Verification Checklist](#verification-checklist)
- [Chapter Summary](#chapter-summary)

---

# Chapter Overview

So far, our three Node.js microservices are successfully running inside Kubernetes and are accessible through the **NGINX Ingress Controller**.

However, every application still requires configuration such as:

- MongoDB Atlas Connection String
- JWT Secret
- Environment Variables
- Database Name
- Application Environment

Hardcoding these values inside the source code or Docker image is **not recommended** because it exposes sensitive information and makes deployments difficult across multiple environments.

In this chapter, we'll learn how to securely manage application configuration using **Kubernetes ConfigMaps** and **Secrets**, and connect all three services to **MongoDB Atlas**.

---

# What You Will Build

By the end of this chapter, you will have:

- ✅ MongoDB Atlas Database
- ✅ Kubernetes ConfigMap
- ✅ Kubernetes Secret
- ✅ Environment Variables injected into Pods
- ✅ Auth Service connected to MongoDB Atlas
- ✅ User Service connected to MongoDB Atlas
- ✅ Product Service connected to MongoDB Atlas
- ✅ Production-ready configuration management

---

# Why Use ConfigMaps and Secrets?

Consider the following code:

```javascript
mongoose.connect(
  "mongodb+srv://admin:password123@cluster.mongodb.net/microservices"
);
```

## Problems

- Password is visible in source code
- Credentials are committed to Git
- Every environment requires code changes
- Security risk
- Difficult to maintain

Instead, use environment variables:

```javascript
mongoose.connect(process.env.MONGO_URI);
```

The application simply reads an environment variable, while Kubernetes injects the actual value.

---

# Configuration Flow

```text
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
```

---

# Step 1 – Create a MongoDB Atlas Cluster

1. Sign in to **MongoDB Atlas**
2. Create a **Free M0 Cluster**
3. Create a **Database User**
4. Whitelist your IP address
   - For development only, you can temporarily allow `0.0.0.0/0`
5. Click:

```
Connect
   ↓
Drivers
```

Copy the generated connection string.

Example:

```text
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/microservices
```

Replace:

- `username`
- `password`
- `microservices`

with your own values.

---

# Step 2 – Update the Node.js Code

Install required packages:

```bash
npm install mongoose dotenv
```

Update each service (`auth-service`, `user-service`, and `product-service`):

```javascript
require("dotenv").config();

const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection failed:", err));
```

> **Never hardcode your MongoDB connection string.**

---

# Step 3 – Local Development with .env

Create a `.env` file inside each service.

Example:

```env
PORT=3002

MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/microservices

JWT_SECRET=mySecretKey
```

Start the application:

```bash
npm start
```

Expected output:

```text
Connected to MongoDB Atlas
```

---

# Issue We Faced

During development, the application printed:

```text
COON undefined
```

Followed by:

```text
MongooseError:

The 'uri' parameter to openUri() must be a string

got "undefined"
```

## Cause

`process.env.MONGO_URI` was undefined because:

- `.env` file was missing
- `dotenv` wasn't loaded
- `MONGO_URI` wasn't defined

## Solution

Install:

```bash
npm install dotenv
```

At the top of `index.js`:

```javascript
require("dotenv").config();
```

Verify:

```javascript
console.log(process.env.MONGO_URI);
```

If the URI prints correctly, MongoDB should connect successfully.

> This was one of the real issues encountered while building this project.

---

# Step 4 – Create a ConfigMap

ConfigMaps store **non-sensitive configuration**.

Create:

```
k8s/configmap.yaml
```

```yaml
apiVersion: v1
kind: ConfigMap

metadata:
  name: microservice-config

data:
  NODE_ENV: production
```

Apply:

```bash
kubectl apply -f configmap.yaml
```

Verify:

```bash
kubectl get configmap
```

Describe:

```bash
kubectl describe configmap microservice-config
```

---

# Step 5 – Create a Secret

Secrets store **sensitive information**.

Create:

```
k8s/secret.yaml
```

## Option 1 – Using `stringData` (Recommended)

```yaml
apiVersion: v1
kind: Secret

metadata:
  name: microservice-secret

type: Opaque

stringData:
  MONGO_URI: mongodb+srv://username:password@cluster.mongodb.net/microservices
  JWT_SECRET: mySecretKey
```

Apply:

```bash
kubectl apply -f secret.yaml
```

Verify:

```bash
kubectl get secrets
```

Describe:

```bash
kubectl describe secret microservice-secret
```

> **Note:** `kubectl describe` does not display secret values.

---

## Option 2 – Create Secret from CLI

```bash
kubectl create secret generic microservice-secret \
--from-literal=MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/microservices" \
--from-literal=JWT_SECRET="mySecretKey"
```

---

# Step 6 – Use the Secret in a Deployment

Update each deployment.

Example (`auth-deployment.yaml`):

```yaml
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
```

Repeat the same configuration for:

- `user-deployment.yaml`
- `product-deployment.yaml`

---

# Step 7 – Apply the Changes

```bash
kubectl apply -f configmap.yaml

kubectl apply -f secret.yaml

kubectl apply -f auth-deployment.yaml

kubectl apply -f user-deployment.yaml

kubectl apply -f product-deployment.yaml
```

---

# Step 8 – Restart the Deployments

```bash
kubectl rollout restart deployment auth-deployment

kubectl rollout restart deployment user-deployment

kubectl rollout restart deployment product-deployment
```

---

# Step 9 – Verify the Pods

```bash
kubectl get pods
```

Expected:

```text
Running
```

---

# Step 10 – Verify Environment Variables

List Pods:

```bash
kubectl get pods
```

Open a shell:

```bash
kubectl exec -it auth-deployment-xxxxx -- sh
```

Inside the container:

```bash
printenv
```

Or check specific variables:

```bash
echo $MONGO_URI

echo $JWT_SECRET

echo $NODE_ENV
```

The values should match those defined in your Kubernetes Secret and ConfigMap.

---

# Step 11 – Verify MongoDB Connectivity

Check the application logs:

```bash
kubectl logs auth-deployment-xxxxx
```

Expected:

```text
Connected to MongoDB Atlas
```

Repeat for:

```bash
kubectl logs user-deployment-xxxxx

kubectl logs product-deployment-xxxxx
```

---

# Step 12 – Create a Sample Collection

Insert a document into MongoDB Atlas.

Example:

```json
{
  "name": "Laptop",
  "price": 85000
}
```

Verify the document appears in MongoDB Atlas.

This confirms the application is successfully connected.

---

# Folder Structure

```text
Microservice-Docker-Kubernetes

├── auth-service
├── user-service
├── product-service
│
├── k8s
│   ├── auth-deployment.yaml
│   ├── user-deployment.yaml
│   ├── product-deployment.yaml
│   ├── auth-service.yaml
│   ├── user-service.yaml
│   ├── product-service.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   └── ingress.yaml
│
└── helm
```

---

# Common Commands

## Create ConfigMap

```bash
kubectl apply -f configmap.yaml
```

## Create Secret

```bash
kubectl apply -f secret.yaml
```

## View ConfigMaps

```bash
kubectl get configmap
```

## View Secrets

```bash
kubectl get secrets
```

## Describe ConfigMap

```bash
kubectl describe configmap microservice-config
```

## Describe Secret

```bash
kubectl describe secret microservice-secret
```

## Restart Deployments

```bash
kubectl rollout restart deployment auth-deployment

kubectl rollout restart deployment user-deployment

kubectl rollout restart deployment product-deployment
```

## View Logs

```bash
kubectl logs <pod-name>
```

---

# Common Issues We Solved

## 1. MONGO_URI Undefined

**Error**

```text
COON undefined
```

### Cause

- Missing `.env`
- `dotenv` not loaded
- Environment variable not injected

### Solution

- Add `require("dotenv").config()`
- Verify `.env`
- Ensure Deployment references the Secret

---

## 2. MongoDB Connection Failed

Possible causes:

- Incorrect username/password
- IP not whitelisted
- Invalid connection string
- Secret contains incorrect values

Verify your MongoDB Atlas configuration and recreate the Secret if necessary.

---

## 3. Secret Not Updated

Updating a Secret **does not automatically restart Pods**.

Restart the deployments:

```bash
kubectl rollout restart deployment auth-deployment

kubectl rollout restart deployment user-deployment

kubectl rollout restart deployment product-deployment
```

---

## 4. Environment Variable Missing Inside the Container

Verify:

```bash
kubectl get secret
```

Check the Deployment:

```bash
kubectl describe deployment auth-deployment
```

Ensure the `env` section correctly references the Secret and ConfigMap keys.

---

# Best Practices

- Store passwords and API keys in **Secrets**
- Store non-sensitive configuration in **ConfigMaps**
- Never commit `.env` files containing real credentials
- Use consistent environment variable names across all services
- Restart Deployments after updating Secrets or ConfigMaps
- Test MongoDB connectivity locally before deploying to Kubernetes

---

# Verification Checklist

Before moving to the next chapter, ensure:

- ✅ MongoDB Atlas cluster is running
- ✅ All three services connect successfully
- ✅ ConfigMap is created
- ✅ Secret is created
- ✅ Environment variables are injected into Pods
- ✅ Logs show **Connected to MongoDB Atlas**
- ✅ Sensitive credentials are no longer hardcoded

---

# Chapter Summary

In this chapter, we connected the **Auth**, **User**, and **Product** microservices to **MongoDB Atlas** and learned how to securely manage configuration using **Kubernetes ConfigMaps** and **Secrets**.

We replaced hardcoded values with environment variables, injected them into Pods, and solved real-world issues such as:

- `MONGO_URI` being undefined
- MongoDB connection failures
- Secret updates not reflecting until Pods restarted
- Missing environment variables inside containers

These are common production issues, and understanding how to troubleshoot them is an essential Kubernetes skill.

---

# Next Chapter

In **Chapter 8 – JWT Authentication & Service-to-Service Security**, we will implement secure authentication using **JSON Web Tokens (JWT)**.

The **Auth Service** will generate signed tokens, the **User Service** will validate them through middleware, and protected routes will only be accessible to authenticated users, creating a production-ready authentication flow for our microservices.