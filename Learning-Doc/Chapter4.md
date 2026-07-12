Chapter 4 – Docker: Containerizing the Node.js Microservices
Building Production-Ready Node.js Microservices using Docker, Kubernetes, Helm & CI/CD
Chapter Overview

In the previous chapter, we built three independent Node.js microservices. They run successfully on our local machine, but they still depend on the local Node.js installation and environment.

In this chapter, we'll package each service into a Docker image, run it as a Docker container, and publish it to Docker Hub. Containerizing the services ensures they behave consistently across development, testing, and production environments.

By the end of this chapter, you'll have:

A Dockerfile for each service
.dockerignore files
Docker images built locally
Running containers
Images pushed to Docker Hub
Knowledge of common Docker commands
Solutions to the Docker issues we encountered during this project
What is Docker?

Docker is a containerization platform that packages your application, its runtime, libraries, and dependencies into a lightweight, portable image.

Instead of saying:

"It works on my machine."

Docker lets you say:

"It works the same everywhere."

Docker Workflow
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
Step 1 – Verify Docker Installation

Run:

docker version

Expected output:

Client:
 Version: 29.6.1

Server:
 Version: 29.6.1

Check Docker is running:

docker ps

Initially, you may see:

CONTAINER ID   IMAGE   COMMAND   CREATED   STATUS   PORTS   NAMES
Step 2 – Create the Dockerfile

Navigate to the auth-service folder:

cd auth-service

Create a file named:

Dockerfile

Important: The filename must be exactly Dockerfile (no extension).

Add the following content:

FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
Dockerfile Explanation
Instruction	Purpose
FROM node:22-alpine	Uses a lightweight Node.js base image
WORKDIR /app	Sets the working directory
COPY package*.json ./	Copies dependency files
RUN npm install	Installs project dependencies
COPY . .	Copies application source code
EXPOSE 3000	Documents the application's listening port
CMD ["npm","start"]	Starts the application
Step 3 – Create .dockerignore

Create a file named:

.dockerignore

Add:

node_modules
.git
.gitignore
.env
README.md

This keeps the Docker build context small and avoids copying secrets into the image.

Step 4 – Build the Docker Image

Make sure you're inside the auth-service directory:

cd auth-service

Build the image:

docker build -t auth-service:v1 .
Explanation
Part	Meaning
docker build	Build a Docker image
-t	Assign a tag
auth-service:v1	Image name and version
.	Build context (current directory)

Verify:

docker images

Expected:

REPOSITORY        TAG
auth-service      v1
Step 5 – Run the Container
docker run -d -p 3000:3000 --name auth-container auth-service:v1
Explanation
Option	Description
-d	Detached mode
-p 3000:3000	Maps host port to container port
--name	Assigns a container name

Verify:

docker ps

Expected:

CONTAINER ID
IMAGE
STATUS

auth-service:v1

Test:

http://localhost:3000/auth
Step 6 – Repeat for User Service

Create a similar Dockerfile in user-service, changing only the exposed port:

EXPOSE 3001

Build:

docker build -t user-service:v1 .

Run:

docker run -d -p 3001:3001 --name user-container user-service:v1

Test:

http://localhost:3001/user
Step 7 – Repeat for Product Service

Update the Dockerfile:

EXPOSE 3002

Build:

docker build -t product-service:v1 .

Run:

docker run -d -p 3002:3002 --name product-container product-service:v1

Test:

http://localhost:3002/product
Step 8 – View Running Containers
docker ps

Expected:

auth-container
user-container
product-container
Step 9 – View Logs
docker logs auth-container

Follow logs in real time:

docker logs -f auth-container
Step 10 – Stop Containers
docker stop auth-container
docker stop user-container
docker stop product-container
Step 11 – Remove Containers
docker rm auth-container
docker rm user-container
docker rm product-container
Step 12 – Docker Hub

Log in:

docker login

During our project, you successfully logged in as:

Username: firdousalam2058
Step 13 – Tag Images
docker tag auth-service:v1 firdousalam2058/auth-service:v1

docker tag user-service:v1 firdousalam2058/user-service:v1

docker tag product-service:v1 firdousalam2058/product-service:v1
Step 14 – Push Images
docker push firdousalam2058/auth-service:v1

docker push firdousalam2058/user-service:v1

docker push firdousalam2058/product-service:v1
Step 15 – Verify Images
docker images

During our implementation, you saw images similar to:

firdousalam2058/auth-service:v1
firdousalam2058/user-service:v1
firdousalam2058/product-service:v1
Updating an Image

Whenever you modify the application:

Build a new version:
docker build -t auth-service:v2 .
Tag it:
docker tag auth-service:v2 firdousalam2058/auth-service:v2
Push it:
docker push firdousalam2058/auth-service:v2

We'll use these new image versions later for Kubernetes rolling updates.

Common Issues We Solved
1. Dockerfile Not Found

You encountered:

failed to read Dockerfile:
open Dockerfile:
no such file or directory
Cause

The build command was run from the wrong directory (k8s instead of the service folder).

Solution

Navigate to the correct directory:

cd auth-service
docker build -t auth-service:v1 .
2. Push Access Denied

You encountered:

push access denied
repository does not exist
authorization failed
Cause
Wrong Docker Hub username in the image tag.
Repository didn't match the logged-in account.
Solution
Verify login:
docker login
Tag using the correct namespace:
docker tag auth-service:v1 firdousalam2058/auth-service:v1
Push again:
docker push firdousalam2058/auth-service:v1
3. Running the Wrong Image Version

If changes aren't visible:

Rebuild the image.
Increment the tag (v2, v3, etc.).
Push the new tag.
Update the Kubernetes deployment (covered in the next chapter).
Docker Commands Cheat Sheet
Command	Purpose
docker build -t image:v1 .	Build an image
docker images	List images
docker ps	List running containers
docker ps -a	List all containers
docker run -d -p 3000:3000 image:v1	Run a container
docker logs <container>	View logs
docker stop <container>	Stop a container
docker rm <container>	Remove a container
docker rmi <image>	Remove an image
docker tag src dest	Tag an image
docker push <image>	Push to Docker Hub
docker pull <image>	Pull from Docker Hub
Best Practices
Keep Dockerfiles simple and readable.
Use a .dockerignore file.
Never copy .env files into the image.
Use versioned image tags (v1, v2, v3) instead of relying on latest.
Rebuild images after code changes.
Test images locally before pushing them.
Store production configuration using Kubernetes Secrets and ConfigMaps rather than inside the image.
Verify Before Moving On

Before continuing, ensure:

✅ Three Dockerfiles exist.
✅ Three .dockerignore files exist.
✅ Images build successfully.
✅ Containers run correctly.
✅ APIs respond on the expected ports.
✅ Images are pushed to Docker Hub under your account (firdousalam2058).
Chapter Summary

In this chapter, we containerized each Node.js microservice, built Docker images, ran them locally, and published them to Docker Hub. We also documented the Docker-specific issues we encountered—such as building from the wrong directory and image push authorization errors—and their solutions.

What's Next?

In Chapter 5 – Deploying to Kubernetes, we'll use these Docker images to create Kubernetes Deployments and Services, expose them inside the cluster, and enable communication between the three microservices using Kubernetes DNS.