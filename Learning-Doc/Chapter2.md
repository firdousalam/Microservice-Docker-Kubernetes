# 📖 Chapter 2 – Environment Setup

> **Series:** Building Production-Ready Node.js Microservices using Docker, Kubernetes, Helm & CI/CD

---

## 📚 Chapter Overview

Before writing any code, it's important to prepare a reliable development environment. In this chapter, you'll install and verify all the tools required to build, containerize, and deploy production-ready Node.js microservices.

By the end of this chapter, you'll have a fully configured environment capable of:

- Developing Node.js applications
- Building Docker images
- Running a local Kubernetes cluster
- Managing Kubernetes applications with Helm
- Version controlling your project with Git

---

# 🎯 Learning Objectives

After completing this chapter, you will be able to:

- Install all required software
- Verify each installation
- Enable Kubernetes in Docker Desktop
- Configure `kubectl`
- Install Helm
- Create the project folder structure
- Initialize Git
- Understand the purpose of each project folder
- Verify the complete development environment before writing code

---

# 🛠 Software Requirements

| Software | Version | Purpose |
|----------|----------|----------|
| Node.js | 22.x | Backend Runtime |
| npm | 10.x | Package Manager |
| Docker Desktop | Latest | Container Platform |
| Kubernetes | Enabled in Docker Desktop | Container Orchestration |
| kubectl | v1.36.x | Kubernetes CLI |
| Helm | v3.x | Kubernetes Package Manager |
| Git | Latest | Version Control |
| VS Code | Latest | Code Editor |
| Postman | Latest | API Testing |
| MongoDB Atlas | Free Tier | Cloud Database |

---

# 🚀 Step 1 – Install Node.js

Node.js is the JavaScript runtime used to execute our Express.js applications.

### Download

https://nodejs.org

Choose the **LTS (Long-Term Support)** version.

### Verify Installation

```bash
node -v
```

Example:

```text
v22.15.0
```

Verify npm:

```bash
npm -v
```

Example:

```text
10.9.2
```

---

# 💻 Step 2 – Install Visual Studio Code

Download VS Code:

https://code.visualstudio.com

### Recommended Extensions

- Docker
- Kubernetes
- YAML
- ESLint
- Prettier
- GitLens
- Thunder Client (or Postman)

---

# 🌿 Step 3 – Install Git

Download:

https://git-scm.com

Verify installation:

```bash
git --version
```

Example:

```text
git version 2.49.0
```

---

# 🐳 Step 4 – Install Docker Desktop

Download:

https://www.docker.com/products/docker-desktop

### Recommended Settings

- Enable **WSL2 Backend**
- Start Docker Desktop automatically

After installation, launch Docker Desktop and wait until the Docker Engine is running.

---

# ✅ Step 5 – Verify Docker

Check Docker installation:

```bash
docker version
```

Expected output:

```text
Client:
 Version: 29.6.1

Server:
 Version: 29.6.1
```

List local images:

```bash
docker images
```

List running containers:

```bash
docker ps
```

> **Note:** Initially, no images or containers may be present. This is expected.

---

# ☸️ Step 6 – Enable Kubernetes

Open **Docker Desktop** and navigate to:

```text
Settings
    │
    ▼
Kubernetes
    │
    ▼
Enable Kubernetes
    │
    ▼
Apply & Restart
```

Docker Desktop will create a local Kubernetes cluster.

> **Note:** This process may take several minutes.

---

# 🔍 Step 7 – Verify Kubernetes

Check the current Kubernetes context:

```bash
kubectl config current-context
```

Expected:

```text
docker-desktop
```

List all contexts:

```bash
kubectl config get-contexts
```

Expected:

```text
CURRENT   NAME
*         docker-desktop
```

Verify cluster nodes:

```bash
kubectl get nodes
```

Expected:

```text
NAME               STATUS
docker-desktop     Ready
```

---

# ⚠️ Common Kubernetes Errors

## Error 1

```text
Unable to connect to the server:
dial tcp 127.0.0.1:6443:
connectex:
No connection could be made
```

### Cause

Kubernetes is not enabled or running in Docker Desktop.

### Solution

1. Open Docker Desktop.
2. Enable Kubernetes.
3. Wait for initialization to complete.
4. Verify:

```bash
kubectl get nodes
```

---

## Error 2

```text
EOF
```

### Cause

The Kubernetes API Server is still starting.

### Solution

Wait **2–5 minutes**, then retry:

```bash
kubectl get nodes
```

---

# 📦 Step 8 – Install Helm

Helm is the package manager for Kubernetes.

### Install via Chocolatey (Windows)

```bash
choco install kubernetes-helm
```

Or download from:

https://helm.sh

Verify installation:

```bash
helm version
```

Example:

```text
version.BuildInfo(...)
```

---

# 🌐 Step 9 – Create GitHub Repository

Create a new repository:

```text
Microservice-Docker-Kubernetes
```

Initialize Git:

```bash
git init
```

Add the remote repository:

```bash
git remote add origin https://github.com/<username>/Microservice-Docker-Kubernetes.git
```

Verify:

```bash
git remote -v
```

---

# 📁 Step 10 – Create Project Folder

Create the project directory:

```bash
mkdir Microservice-Docker-Kubernetes
cd Microservice-Docker-Kubernetes
```

---

# 🏗 Step 11 – Create Project Structure

Create the following folder structure:

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

### Folder Explanation

| Folder | Purpose |
|---------|----------|
| auth-service | Authentication APIs |
| user-service | User Management APIs |
| product-service | Product APIs |
| k8s | Kubernetes YAML Manifests |
| helm | Helm Charts |
| .github | GitHub Actions Workflows |

---

# 💻 Step 12 – Open the Project in VS Code

Open the project:

```bash
code .
```

Your Explorer should display:

```text
auth-service
user-service
product-service
k8s
helm
```

---

# 🚫 Step 13 – Create `.gitignore`

Create a `.gitignore` file in the project root.

```gitignore
node_modules/
.env
dist/
coverage/
Dockerfile.old
npm-debug.log
.vscode/
.idea/
```

> **Why?**  
> The `node_modules/` directory contains downloaded dependencies and should never be committed to Git.

---

# ✅ Step 14 – Verify Everything

Run the following commands:

```bash
node -v

npm -v

docker version

docker ps

docker images

kubectl get nodes

kubectl version --client

helm version

git --version
```

You should confirm that:

- ✅ Node.js is installed
- ✅ npm is installed
- ✅ Docker is running
- ✅ Kubernetes node is in the **Ready** state
- ✅ Helm is installed
- ✅ Git is available

---

# 🛠 Step 15 – Troubleshooting Checklist

## `kubectl get nodes` fails

- Ensure Kubernetes is enabled in Docker Desktop.
- Wait until the cluster finishes starting.
- Verify the current context:

```bash
kubectl config current-context
```

Expected:

```text
docker-desktop
```

---

## Docker is not running

Start Docker Desktop and wait until the Docker Engine is fully initialized.

---

## `helm` command not found

Reinstall Helm and restart your terminal.

---

## `docker images` is empty

This is expected before building your first Docker images.

---

## VS Code cannot find Node.js

Restart VS Code after installing Node.js.

---

# 📚 Chapter Summary

Congratulations! 🎉

Your development environment is now ready.

At this point, you should have:

- ✅ Node.js and npm installed
- ✅ Docker Desktop running
- ✅ Kubernetes enabled and verified
- ✅ `kubectl` configured
- ✅ Helm installed
- ✅ Git initialized
- ✅ VS Code configured
- ✅ A clean project structure ready for development
- ✅ A `.gitignore` file to keep your repository clean

---

# 🚀 What's Next?

In **Chapter 3 – Building the Three Node.js Microservices**, we will:

- Create the **Auth Service**
- Create the **User Service**
- Create the **Product Service**
- Initialize each project using Express.js
- Build REST APIs
- Add Health Check endpoints
- Prepare for MongoDB Atlas integration
- Organize the codebase for Docker and Kubernetes deployment

---

## 📌 End of Chapter 2

Your machine is now fully configured and ready to build production-grade Node.js microservices with Docker, Kubernetes, Helm, and GitHub Actions.