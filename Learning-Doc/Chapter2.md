Chapter 2 – Environment Setup
Building Production-Ready Node.js Microservices using Docker, Kubernetes, Helm & CI/CD
Chapter Overview

Before writing any code, it's important to prepare your development environment correctly. In this chapter, we'll install and verify all the tools required to build, containerize, and deploy our microservices.

By the end of this chapter, you'll have a working development environment capable of running Node.js applications, building Docker images, deploying to Kubernetes, and managing applications with Helm.

Learning Objectives

After completing this chapter, you will be able to:

Install all required software
Verify each installation
Enable Kubernetes in Docker Desktop
Configure kubectl
Install Helm
Create the project folder structure
Initialize Git
Understand the purpose of each folder
Verify your environment before writing code
Software Requirements
Software	Version Used	Purpose
Node.js	22.x	Backend Runtime
npm	10.x	Package Manager
Docker Desktop	Latest	Container Platform
Kubernetes	Enabled in Docker Desktop	Container Orchestration
kubectl	v1.36.x	Kubernetes CLI
Helm	v3.x	Kubernetes Package Manager
Git	Latest	Version Control
VS Code	Latest	Code Editor
Postman	Latest	API Testing
MongoDB Atlas	Free Tier	Cloud Database
Step 1 – Install Node.js

Node.js is the JavaScript runtime that will execute our Express.js applications.

Download

https://nodejs.org

Choose the LTS (Long-Term Support) version.

Verify Installation
node -v

Example:

v22.15.0

Verify npm:

npm -v

Example:

10.9.2
Step 2 – Install Visual Studio Code

Download:

https://code.visualstudio.com

Recommended Extensions:

Docker
Kubernetes
YAML
ESLint
Prettier
GitLens
Thunder Client (or Postman)
Step 3 – Install Git

Download:

https://git-scm.com

Verify:

git --version

Example:

git version 2.49.0
Step 4 – Install Docker Desktop

Download:

https://www.docker.com/products/docker-desktop

Enable:

Use WSL2 Backend
Start Docker Desktop automatically

After installation, open Docker Desktop and wait until it reports that Docker is running.

Step 5 – Verify Docker

Run:

docker version

Expected output (similar to yours):

Client:
 Version: 29.6.1

Server:
 Version: 29.6.1

List images:

docker images

List running containers:

docker ps

At the beginning, you may see no running containers.

Step 6 – Enable Kubernetes

Open Docker Desktop:

Settings

↓

Kubernetes

↓

Enable Kubernetes

↓

Apply & Restart

Docker Desktop will create a local Kubernetes cluster.

This process may take several minutes.

Step 7 – Verify Kubernetes

Check the current context:

kubectl config current-context

Expected:

docker-desktop

List contexts:

kubectl config get-contexts

Expected:

CURRENT NAME
* docker-desktop

Verify nodes:

kubectl get nodes

Expected:

NAME                     STATUS
docker-desktop           Ready
Common Error We Encountered
Error
Unable to connect to the server:
dial tcp 127.0.0.1:6443:
connectex:
No connection could be made
Cause

Kubernetes was not running in Docker Desktop.

Solution
Open Docker Desktop.
Enable Kubernetes.
Wait for initialization.
Verify:
kubectl get nodes
Another Error
EOF
Cause

The Kubernetes API server was still starting.

Solution

Wait 2–5 minutes and try again.

Step 8 – Install Helm

Helm is the package manager for Kubernetes.

Install via Chocolatey:

choco install kubernetes-helm

Or download from:

https://helm.sh

Verify:

helm version

Example:

version.BuildInfo
Step 9 – Create GitHub Repository

Repository name:

Microservice-Docker-Kubernetes

Initialize Git:

git init

Add the remote:

git remote add origin https://github.com/<username>/Microservice-Docker-Kubernetes.git

Verify:

git remote -v
Step 10 – Create Project Folder

Create the root directory:

mkdir Microservice-Docker-Kubernetes
cd Microservice-Docker-Kubernetes
Step 11 – Create Project Structure

Create the folders:

Microservice-Docker-Kubernetes

│
├── auth-service
├── user-service
├── product-service
├── k8s
├── helm
└── .github

Explanation:

Folder	Purpose
auth-service	Authentication APIs
user-service	User APIs
product-service	Product APIs
k8s	Kubernetes YAML files
helm	Helm Chart
.github	GitHub Actions
Step 12 – Open the Project in VS Code

Open the project:

code .

Your Explorer should show:

auth-service
user-service
product-service
k8s
helm
Step 13 – Create .gitignore

Create:

.gitignore

Add:

node_modules/
.env
dist/
coverage/
Dockerfile.old
npm-debug.log
.vscode/
.idea/

During our implementation, we specifically added node_modules/ to .gitignore to avoid committing dependencies to Git.

Step 14 – Verify Everything

Run the following commands:

node -v
npm -v
docker version
docker ps
docker images
kubectl get nodes
kubectl version --client
helm version
git --version

You should see:

Docker running
Kubernetes node in Ready state
Helm installed
Git available
Node.js installed
Step 15 – Troubleshooting Checklist
kubectl get nodes fails
Ensure Kubernetes is enabled in Docker Desktop.
Wait until the cluster finishes starting.
Verify the context:
kubectl config current-context

It should be:

docker-desktop
Docker is not running

Start Docker Desktop and wait for the engine to initialize.

Helm command not found

Reinstall Helm and restart your terminal.

docker images is empty

This is expected before building your first images.

VS Code cannot find Node.js

Restart VS Code after installing Node.js.

Chapter Summary

Congratulations! Your development environment is now ready.

At this point, you should have:

Node.js and npm installed
Docker Desktop running
Kubernetes enabled and verified
kubectl configured
Helm installed
Git initialized
VS Code configured
A clean project structure ready for development
A .gitignore file to keep your repository clean
What's Next?

In Chapter 3 – Building the Three Node.js Microservices, we'll start creating the auth-service, user-service, and product-service. You'll initialize each project with Express, define routes, add health check endpoints, prepare for MongoDB Atlas integration, and structure the code so it's ready for Docker and Kubernetes deployment.