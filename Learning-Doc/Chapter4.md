# 📖 Chapter 4 – Docker: Containerizing the Node.js Microservices

> **Series:** Building Production-Ready Node.js Microservices using Docker, Kubernetes, Helm & CI/CD

---

# 📚 Chapter Overview

In the previous chapter, we built three independent Node.js microservices. They run successfully on our local machine, but they still depend on the local Node.js installation and environment.

In this chapter, we'll package each service into a Docker image, run it as a Docker container, and publish it to Docker Hub.

Containerizing our services ensures they behave consistently across development, testing, and production environments.

---

# 🎯 Learning Objectives

By the end of this chapter, you will have:

- ✅ Dockerfile for each microservice
- ✅ `.dockerignore` file for each service
- ✅ Docker images built locally
- ✅ Running Docker containers
- ✅ Images published to Docker Hub
- ✅ Understanding of essential Docker commands
- ✅ Solutions to common Docker issues encountered during this project

---

# 🐳 What is Docker?

Docker is a **containerization platform** that packages your application, runtime, libraries, and dependencies into a lightweight, portable image.

Instead of saying:

> *"It works on my machine."*

Docker lets you confidently say:

> **"It works the same everywhere."**

---

# 🏗 Docker Workflow

```text
Node.js Source Code
        │
        ▼
    Dockerfile
        │
        ▼
   Docker Build
        │
        ▼
   Docker Image
        │
        ▼
 Docker Container
```

---

# 🚀 Step 1 – Verify Docker Installation

Verify Docker is installed:

```bash
docker version
```

Example output:

```text
Client:
 Version: 29.6.1

Server:
 Version: 29.6.1
```

Check whether Docker is running:

```bash
docker ps
```

Initially, you may see:

```text
CONTAINER ID   IMAGE   COMMAND   CREATED   STATUS   PORTS   NAMES
```

This simply means there are no running containers yet.

---

# 📦 Step 2 – Create the Dockerfile

Navigate to the **Auth Service**.

```bash
cd auth-service
```

Create a file named:

```text
Dockerfile
```

> **Important:** The filename must be exactly `Dockerfile` (no extension).

Add the following content:

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

---

# 📖 Dockerfile Explanation

| Instruction | Purpose |
|------------|----------|
| `FROM node:22-alpine` | Uses a lightweight Node.js image |
| `WORKDIR /app` | Sets the working directory |
| `COPY package*.json ./` | Copies dependency files |
| `RUN npm install` | Installs project dependencies |
| `COPY . .` | Copies application source code |
| `EXPOSE 3000` | Documents the application's listening port |
| `CMD ["npm","start"]` | Starts the application |

---

# 🚫 Step 3 – Create `.dockerignore`

Create a file named:

```text
.dockerignore
```

Add the following:

```gitignore
node_modules
.git
.gitignore
.env
README.md
```

Using a `.dockerignore` file keeps the Docker build context small and prevents sensitive files from being copied into the image.

---

# 🔨 Step 4 – Build the Docker Image

Ensure you are inside the `auth-service` directory.

Build the image:

```bash
docker build -t auth-service:v1 .
```

### Command Breakdown

| Part | Meaning |
|------|----------|
| `docker build` | Builds a Docker image |
| `-t` | Assigns a tag |
| `auth-service:v1` | Image name and version |
| `.` | Current directory as the build context |

Verify the image:

```bash
docker images
```

Expected:

```text
REPOSITORY        TAG

auth-service      v1
```

---

# ▶️ Step 5 – Run the Container

Run the container:

```bash
docker run -d -p 3000:3000 --name auth-container auth-service:v1
```

### Command Breakdown

| Option | Description |
|---------|-------------|
| `-d` | Run container in detached mode |
| `-p 3000:3000` | Maps host port to container port |
| `--name` | Assigns a container name |

Verify:

```bash
docker ps
```

Expected:

```text
CONTAINER ID
IMAGE
STATUS

auth-service:v1
```

Test the API:

```http
GET http://localhost:3000/auth
```

---

# 👤 Step 6 – Repeat for User Service

Create a similar `Dockerfile` inside **user-service**.

Only change the exposed port:

```dockerfile
EXPOSE 3001
```

Build:

```bash
docker build -t user-service:v1 .
```

Run:

```bash
docker run -d -p 3001:3001 --name user-container user-service:v1
```

Verify:

```http
GET http://localhost:3001/user
```

---

# 🛒 Step 7 – Repeat for Product Service

Update the Dockerfile:

```dockerfile
EXPOSE 3002
```

Build:

```bash
docker build -t product-service:v1 .
```

Run:

```bash
docker run -d -p 3002:3002 --name product-container product-service:v1
```

Verify:

```http
GET http://localhost:3002/product
```

---

# 📋 Step 8 – View Running Containers

List all running containers:

```bash
docker ps
```

Expected:

```text
auth-container
user-container
product-container
```

---

# 📄 Step 9 – View Container Logs

View logs:

```bash
docker logs auth-container
```

Follow logs in real time:

```bash
docker logs -f auth-container
```

---

# ⏹ Step 10 – Stop Containers

```bash
docker stop auth-container
docker stop user-container
docker stop product-container
```

---

# 🗑 Step 11 – Remove Containers

```bash
docker rm auth-container
docker rm user-container
docker rm product-container
```

---

# ☁️ Step 12 – Log in to Docker Hub

Authenticate with Docker Hub:

```bash
docker login
```

During this project, we logged in using:

```text
Username: firdousalam2058
```

---

# 🏷 Step 13 – Tag Docker Images

Tag each image before pushing it to Docker Hub.

```bash
docker tag auth-service:v1 firdousalam2058/auth-service:v1

docker tag user-service:v1 firdousalam2058/user-service:v1

docker tag product-service:v1 firdousalam2058/product-service:v1
```

---

# ☁️ Step 14 – Push Images to Docker Hub

Push each image:

```bash
docker push firdousalam2058/auth-service:v1

docker push firdousalam2058/user-service:v1

docker push firdousalam2058/product-service:v1
```

---

# ✅ Step 15 – Verify Docker Images

Run:

```bash
docker images
```

Expected:

```text
firdousalam2058/auth-service:v1

firdousalam2058/user-service:v1

firdousalam2058/product-service:v1
```

---

# 🔄 Updating an Image

Whenever you modify your application:

### Build a new version

```bash
docker build -t auth-service:v2 .
```

### Tag it

```bash
docker tag auth-service:v2 firdousalam2058/auth-service:v2
```

### Push it

```bash
docker push firdousalam2058/auth-service:v2
```

> We will use these versioned images later when performing **Kubernetes Rolling Updates**.

---

# ⚠️ Common Issues We Solved

## 1. Dockerfile Not Found

Error:

```text
failed to read Dockerfile:
open Dockerfile:
no such file or directory
```

### Cause

The build command was executed from the wrong directory (for example, `k8s` instead of `auth-service`).

### Solution

```bash
cd auth-service

docker build -t auth-service:v1 .
```

---

## 2. Push Access Denied

Error:

```text
push access denied
repository does not exist
authorization failed
```

### Cause

- Incorrect Docker Hub username
- Repository name doesn't match the logged-in account

### Solution

Login:

```bash
docker login
```

Retag the image:

```bash
docker tag auth-service:v1 firdousalam2058/auth-service:v1
```

Push again:

```bash
docker push firdousalam2058/auth-service:v1
```

---

## 3. Running the Wrong Image Version

If your latest code changes aren't reflected:

- Rebuild the image
- Increment the version (`v2`, `v3`, ...)
- Push the new version
- Update the Kubernetes Deployment

---

# 📋 Docker Commands Cheat Sheet

| Command | Purpose |
|----------|----------|
| `docker build -t image:v1 .` | Build an image |
| `docker images` | List images |
| `docker ps` | List running containers |
| `docker ps -a` | List all containers |
| `docker run -d -p 3000:3000 image:v1` | Run a container |
| `docker logs <container>` | View logs |
| `docker stop <container>` | Stop a container |
| `docker rm <container>` | Remove a container |
| `docker rmi <image>` | Remove an image |
| `docker tag src dest` | Tag an image |
| `docker push <image>` | Push an image |
| `docker pull <image>` | Pull an image |

---

# 💡 Best Practices

- Keep Dockerfiles simple and readable.
- Always use a `.dockerignore` file.
- Never copy `.env` files into Docker images.
- Use versioned image tags (`v1`, `v2`, `v3`) instead of relying on `latest`.
- Rebuild images after every code change.
- Test Docker images locally before pushing.
- Store production configuration using Kubernetes **Secrets** and **ConfigMaps**, not inside Docker images.

---

# ✅ Verify Before Moving On

Before proceeding to the next chapter, ensure that:

- ✅ Three Dockerfiles exist
- ✅ Three `.dockerignore` files exist
- ✅ Docker images build successfully
- ✅ Containers start correctly
- ✅ APIs respond on the expected ports
- ✅ Images are published to Docker Hub under **firdousalam2058**

---

# 📚 Chapter Summary

In this chapter, we containerized each Node.js microservice using Docker. We created Dockerfiles, built Docker images, ran containers locally, and published the images to Docker Hub.

We also addressed common Docker issues encountered during development, including:

- Building from the wrong directory
- Dockerfile not found errors
- Docker Hub authentication failures
- Image versioning

These practices provide a strong foundation for deploying applications in Kubernetes.

---

# 🚀 What's Next?

In **Chapter 5 – Deploying to Kubernetes**, we will:

- Create Kubernetes Deployments
- Create Kubernetes Services
- Deploy our Docker images
- Enable communication between microservices
- Use Kubernetes DNS-based service discovery
- Prepare the application for NGINX Ingress and production deployment

This is where we transition from standalone Docker containers to a fully orchestrated Kubernetes environment.

---

## 📌 End of Chapter 4

Congratulations! 🎉

You have successfully containerized your Node.js microservices and published them to Docker Hub. Your application is now ready to be deployed and managed by Kubernetes.