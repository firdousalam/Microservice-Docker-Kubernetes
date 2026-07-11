# Microservice-Docker-Kubernetes
This project is to create Microservices using Docker Kubernetes Ingress etc


This is one of the best projects to learn Docker + Kubernetes + Microservices from scratch.

Project Architecture
                    Browser
                       |
                 http://localhost
                       |
               Kubernetes Ingress
                       |
      -----------------------------------
      |                |               |
      |                |               |
 Auth Service     User Service    Product Service
(Node.js)          (Node.js)       (Node.js)
      |                |               |
      -----------------------------------
                 Internal Service Calls
                       |
                  Kubernetes DNS


We'll use

Node.js + Express
Docker
Docker Hub (or local image)
Kubernetes (Docker Desktop Kubernetes OR Minikube)
NGINX Ingress Controller
Step 1 Install Required Software

Install

NodeJS LTS
Docker Desktop
Kubernetes (Enable inside Docker Desktop)
kubectl
VS Code

Verify

node -v

npm -v

docker -v

kubectl version --client

kubectl get nodes

Expected

NAME             STATUS
docker-desktop   Ready
Step 2 Create Project
microservices-demo/

    auth-service/

    user-service/

    product-service/

    k8s/

        auth-deployment.yaml
        user-deployment.yaml
        product-deployment.yaml

        ingress.yaml
Step 3 Create Auth Service
mkdir auth-service
cd auth-service

npm init -y

npm install express axios

Create

index.js
const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("Auth Service");
});

app.listen(3000, () => {
    console.log("Auth running");
});

package.json

"scripts": {
   "start":"node index.js"
}

Run

npm start

Visit

localhost:3000
Step 4 Create User Service

Exactly same

Port

3001

Return

User Service
Step 5 Create Product Service

Port

3002

Return

Product Service
Step 6 Service Communication

Example

User Service

const axios = require("axios");

app.get("/user", async (req,res)=>{

const response = await axios.get("http://auth-service:3000");

res.send({
    user:"John",
    auth:response.data
});

});

Notice

auth-service

This is Kubernetes Service Name.

Step 7 Dockerfile

Same Dockerfile for all services

FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm","start"]

For other services

Only expose

3001
3002
Step 8 Build Docker Images

Auth

cd auth-service

docker build -t auth-service:v1 .

User

docker build -t user-service:v1 .

Product

docker build -t product-service:v1 .

Verify

docker images
Step 9 Run Containers

Auth

docker run -d \
-p 3000:3000 \
--name auth auth-service:v1

User

docker run -d \
-p 3001:3001 \
--name user user-service:v1

Product

docker run -d \
-p 3002:3002 \
--name product product-service:v1

Verify

docker ps
Step 10 Enable Kubernetes

Docker Desktop

Settings

Kubernetes

Enable Kubernetes

Wait until

kubectl get nodes

shows Ready.

Step 11 Kubernetes Deployment

Example

auth-deployment.yaml

apiVersion: apps/v1
kind: Deployment

metadata:
  name: auth-deployment

spec:
  replicas: 1

  selector:
    matchLabels:
      app: auth

  template:

    metadata:
      labels:
        app: auth

    spec:

      containers:

      - name: auth

        image: auth-service:v1

        imagePullPolicy: Never

        ports:
        - containerPort: 3000
Step 12 Create Service
apiVersion: v1
kind: Service

metadata:
  name: auth-service

spec:

  selector:
    app: auth

  ports:

  - port: 3000
    targetPort: 3000

Repeat for User and Product.

Step 13 Deploy
kubectl apply -f auth-deployment.yaml

kubectl apply -f user-deployment.yaml

kubectl apply -f product-deployment.yaml

Check

kubectl get pods

Expected

auth

user

product
Step 14 Verify Services
kubectl get svc

Should show

auth-service

user-service

product-service

Now Pods communicate using

http://auth-service:3000

http://user-service:3001

http://product-service:3002

No IP required.

Step 15 Install NGINX Ingress

If you're using Docker Desktop Kubernetes, enable the built-in ingress if available, or install the NGINX Ingress Controller using the official manifests:

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml

Wait until the controller is running:

kubectl get pods -n ingress-nginx
Step 16 Create Ingress
apiVersion: networking.k8s.io/v1

kind: Ingress

metadata:
  name: microservices-ingress

spec:

  ingressClassName: nginx

  rules:

  - http:

      paths:

      - path: /auth
        pathType: Prefix

        backend:

          service:

            name: auth-service

            port:

              number: 3000

      - path: /user
        pathType: Prefix

        backend:

          service:

            name: user-service

            port:

              number: 3001

      - path: /product
        pathType: Prefix

        backend:

          service:

            name: product-service

            port:

              number: 3002

Apply

kubectl apply -f ingress.yaml
Step 17 Test
kubectl get ingress

Open

http://localhost/auth

http://localhost/user

http://localhost/product

The Ingress routes each request to the correct service.

Step 18 Verify Everything

Pods

kubectl get pods

Deployments

kubectl get deployments

Services

kubectl get svc

Ingress

kubectl get ingress

Logs

kubectl logs <pod-name>

Describe

kubectl describe pod <pod-name>
Final Architecture
                    Browser
                        │
                        │
                http://localhost
                        │
                NGINX Ingress
                        │
        ┌───────────────┼────────────────┐
        │               │                │
     /auth           /user          /product
        │               │                │
        ▼               ▼                ▼
  Auth Service     User Service    Product Service
      Pod              Pod              Pod
        │               │                │
        └───────────────┼────────────────┘
                        │
           Kubernetes Cluster Network
                        │
                Service-to-Service Calls
             (e.g., http://auth-service:3000)

This project demonstrates the complete local microservices workflow: Node.js services → Docker images → Containers → Kubernetes Deployments → Services → Pod-to-Pod communication → Ingress routing, closely matching how applications are deployed in production environments.


Project Roadmap
Phase 1
--------
✅ Create 3 Node.js Services
✅ Dockerize Services
✅ Push Images to Docker Hub
✅ Kubernetes Deployments
✅ Running Pods

Phase 2
--------
➡ Create Kubernetes Services
➡ Service Discovery
➡ Pod-to-Pod Communication

Phase 3
--------
➡ Install NGINX Ingress
➡ Configure Ingress
➡ Access Services from Browser

Phase 4
--------
➡ ConfigMaps
➡ Secrets

Phase 5
--------
➡ MongoDB Deployment
➡ Persistent Volume
➡ Connect Services

Phase 6
--------
➡ Health Checks
➡ Readiness Probe
➡ Liveness Probe

Phase 7
--------
➡ HPA (Horizontal Pod Autoscaler)

Phase 8
--------
➡ GitHub Actions CI/CD

Phase 9
--------
➡ Helm Charts
Current Status

You have completed

✔ Auth Service
✔ User Service
✔ Product Service
✔ Docker Images
✔ Docker Hub
✔ Kubernetes Deployment
✔ Running Pods

Now we continue.

STEP 15 — Create Kubernetes Services
What is a Service?

Currently

Browser
      ❌
      |
Pod

Pods get recreated.

Their IP changes.

You should never call a Pod directly.

Instead Kubernetes creates a stable endpoint called Service.

Browser
      |
 Service
      |
     Pod
Directory Structure
Microservice-Docker-Kubernetes

│
├── auth-service
├── user-service
├── product-service
│
└── k8s
      │
      ├── auth-deployment.yaml
      ├── user-deployment.yaml
      ├── product-deployment.yaml
      │
      ├── auth-service.yaml
      ├── user-service.yaml
      ├── product-service.yaml
STEP 15.1

Create

auth-service.yaml
apiVersion: v1
kind: Service

metadata:
  name: auth-service

spec:

  selector:
    app: auth

  ports:
    - protocol: TCP
      port: 3000
      targetPort: 3000

  type: ClusterIP

Save.

STEP 15.2

Create

user-service.yaml
apiVersion: v1
kind: Service

metadata:
  name: user-service

spec:

  selector:
    app: user

  ports:
    - protocol: TCP
      port: 3001
      targetPort: 3001

  type: ClusterIP

Save.

STEP 15.3

Create

product-service.yaml
apiVersion: v1
kind: Service

metadata:
  name: product-service

spec:

  selector:
    app: product

  ports:
    - protocol: TCP
      port: 3002
      targetPort: 3002

  type: ClusterIP

Save.

STEP 15.4

Deploy all Services

kubectl apply -f auth-service.yaml
kubectl apply -f user-service.yaml
kubectl apply -f product-service.yaml
STEP 15.5

Verify

kubectl get svc

Expected

NAME              TYPE        PORT

auth-service      ClusterIP

user-service      ClusterIP

product-service   ClusterIP

kubernetes
STEP 15.6

Describe

kubectl describe svc auth-service

Observe

Selector

Endpoints

ClusterIP
STEP 15.7

Describe User Service

kubectl describe svc user-service
STEP 15.8

Describe Product Service

kubectl describe svc product-service
STEP 16 — Verify Pod Communication

Get pods

kubectl get pods

Example

user-deployment-xxxxx

Open terminal

kubectl exec -it user-deployment-xxxxx -- sh

Now you are inside Linux.

STEP 16.1

Check DNS

nslookup auth-service

Expected

Name: auth-service

Address: 10.x.x.x
STEP 16.2

Call Auth Service

wget -qO- http://auth-service:3000

Expected

Auth Service
STEP 16.3

Call Product Service

wget -qO- http://product-service:3002

Expected

Product Service
STEP 17

Modify User Service

Install Axios if not already installed.

npm install axios

Update index.js:

const express = require("express");
const axios = require("axios");

const app = express();

app.get("/", (req, res) => {
    res.send("User Service");
});

app.get("/details", async (req, res) => {

    const auth = await axios.get("http://auth-service:3000");

    const product = await axios.get("http://product-service:3002");

    res.json({
        auth: auth.data,
        product: product.data
    });

});

app.listen(3001);
STEP 18

Rebuild image

docker build -t user-service:v2 .

Tag

docker tag user-service:v2 firdousalam2058/user-service:v2

Push

docker push firdousalam2058/user-service:v2

Update Deployment

user-service:v2

Apply

kubectl apply -f user-deployment.yaml
STEP 19

Install NGINX Ingress

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml

Wait

kubectl get pods -n ingress-nginx

All pods should become Running.

STEP 20

Create

ingress.yaml

We'll do this after verifying that the Services work correctly.

Learning Outcome

By the end of this project, you'll understand:

Docker image creation and publishing
Kubernetes Deployments and rolling updates
Services and ClusterIP networking
Kubernetes DNS (auth-service, user-service, etc.)
Pod-to-pod communication
NGINX Ingress routing
Image updates and rolling deployments
Production-ready microservice architecture

I recommend progressing one step at a time: first create and verify the three *-service.yaml files and confirm kubectl get svc shows all three services before moving on to inter-service communication and Ingress.


Since your channel focuses on helping developers learn practical technologies, I'd structure this as a hands-on series rather than trying to cover everything in one video.

Here's a script for Episode 1 covering everything you've completed so far:

Project setup
Creating 3 Node.js microservices
Dockerizing them
Running containers
Creating a Docker Hub account
Pushing images
Enabling Kubernetes
Creating Deployments
Troubleshooting ErrImageNeverPull
Getting all pods to the Running state
YouTube Video Script
Title

Node.js Microservices with Docker & Kubernetes | Part 1 | Complete Beginner Guide

Intro (0:00)

Hello everyone!

Welcome back to Technophile Firdous.

If you're a Node.js developer and want to learn Docker and Kubernetes through a real project, this series is for you.

In this series, we won't learn only theory. We will build a real microservices application from scratch, containerize it with Docker, deploy it on Kubernetes, expose it using Ingress, and make all services communicate with each other.

By the end of this series, you'll understand how microservices are deployed in real companies.

Today's video covers:

Creating three Node.js microservices
Dockerizing each service
Running Docker containers
Creating Kubernetes Deployments
Fixing common deployment issues
Running all three pods successfully

Let's get started.

Project Overview (1:00)

Our project contains three microservices.

Auth Service
User Service
Product Service

Each service runs independently on its own port.

Auth Service → Port 3000

User Service → Port 3001

Product Service → Port 3002

Later in this series, these services will communicate using Kubernetes Services instead of localhost.

Project Structure (2:30)

Let's create the project structure.

Microservice-Docker-Kubernetes

Inside this folder create:

auth-service

user-service

product-service

Each service has:

package.json
index.js
Dockerfile

This is a common structure used in many production projects.

Creating the Services (4:00)

Inside every project install Express.

Create a simple API.

For example:

Auth Service returns:

"Auth Service Running"

User Service returns:

"User Service Running"

Product Service returns:

"Product Service Running"

At this stage, we are only verifying that each service starts correctly.

Running Locally (7:00)

Run all three services.

Open three terminals.

Start each service individually.

Visit:

localhost:3000

localhost:3001

localhost:3002

Verify that every service responds correctly.

Once everything works locally, we are ready to containerize them.

Docker Introduction (9:30)

Instead of installing Node.js and dependencies on every machine, Docker packages everything into a portable image.

The same image works on your laptop, in testing, and in production.

This solves the classic "It works on my machine" problem.

Writing the Dockerfile (11:00)

Each service has its own Dockerfile.

We:

Use the Node base image.
Set the working directory.
Copy package files.
Install dependencies.
Copy the application code.
Expose the application port.
Start the application.

Repeat the same process for all three services.

Building Docker Images (15:00)

Build an image for each service.

For example:

auth-service

user-service

product-service

Verify the images using:

docker images

Now Docker has successfully packaged our applications.

Running Docker Containers (18:00)

Run each image as a container.

Map:

3000

3001

3002

Open the browser again.

Verify that all services still work exactly as before.

The only difference is they are now running inside containers.

Docker Hub (21:00)

The next step is to share these images.

Create a Docker Hub account.

Login using:

docker login

Tag every image with your Docker Hub username.

Push every image to Docker Hub.

Now Kubernetes can download our application from Docker Hub.

Enabling Kubernetes (25:00)

Open Docker Desktop.

Enable Kubernetes.

Wait until the cluster starts.

Verify using:

kubectl get nodes

You should see one Ready node.

This means your local Kubernetes cluster is ready.

Creating Deployments (28:00)

Create Deployment YAML files for:

Auth

User

Product

Each deployment specifies:

Deployment name
Replica count
Labels
Container image
Container port

Deploy them using:

kubectl apply

Now Kubernetes starts creating Pods.

Real-World Debugging (33:00)

Initially, our Pods failed with the error:

ErrImageNeverPull

This is one of the most common mistakes beginners face.

The reason was simple.

The deployment still used:

imagePullPolicy: Never

and an old image name.

We updated the deployment to use the Docker Hub image:

firdousalam2058/auth-service

and changed:

imagePullPolicy: IfNotPresent

After recreating the deployments, Kubernetes downloaded the images successfully.

This kind of debugging is an important skill because similar issues happen in real projects.

Success! (38:00)

Finally, all three Pods became Running.

Verify with:

kubectl get pods

You should see:

Auth Deployment Running

User Deployment Running

Product Deployment Running

Congratulations!

You have successfully deployed your first Node.js microservices on Kubernetes.

What We'll Build Next (40:00)

In the next video, we will:

Create Kubernetes Services
Enable service-to-service communication
Use Kubernetes DNS
Install the NGINX Ingress Controller
Access all services through a single endpoint

This is where the application starts behaving like a real microservices system.

Outro (41:00)

If you found this video helpful, please like it and subscribe to the channel.

If you have any questions or run into issues, leave them in the comments. I'll do my best to help.

Thank you for watching, and I'll see you in the next part of this Kubernetes microservices series.

This script is designed for a 40–45 minute tutorial with live coding and explanations. For better audience retention, I'd split the full course into 8–10 episodes of around 20–30 minutes each, with each episode ending in a working milestone. That format typically performs better on YouTube and makes it easier for viewers to follow along.


Absolutely. Since you're learning Kubernetes, I recommend building this like a real enterprise project instead of just getting it to work.

Project Roadmap
Phase 1
--------
✅ Create 3 Node.js Services
✅ Dockerize Services
✅ Push Images to Docker Hub
✅ Kubernetes Deployments
✅ Running Pods

Phase 2
--------
➡ Create Kubernetes Services
➡ Service Discovery
➡ Pod-to-Pod Communication

Phase 3
--------
➡ Install NGINX Ingress
➡ Configure Ingress
➡ Access Services from Browser

Phase 4
--------
➡ ConfigMaps
➡ Secrets

Phase 5
--------
➡ MongoDB Deployment
➡ Persistent Volume
➡ Connect Services

Phase 6
--------
➡ Health Checks
➡ Readiness Probe
➡ Liveness Probe

Phase 7
--------
➡ HPA (Horizontal Pod Autoscaler)

Phase 8
--------
➡ GitHub Actions CI/CD

Phase 9
--------
➡ Helm Charts
Current Status

You have completed

✔ Auth Service
✔ User Service
✔ Product Service
✔ Docker Images
✔ Docker Hub
✔ Kubernetes Deployment
✔ Running Pods

Now we continue.

STEP 15 — Create Kubernetes Services
What is a Service?

Currently

Browser
      ❌
      |
Pod

Pods get recreated.

Their IP changes.

You should never call a Pod directly.

Instead Kubernetes creates a stable endpoint called Service.

Browser
      |
 Service
      |
     Pod
Directory Structure
Microservice-Docker-Kubernetes

│
├── auth-service
├── user-service
├── product-service
│
└── k8s
      │
      ├── auth-deployment.yaml
      ├── user-deployment.yaml
      ├── product-deployment.yaml
      │
      ├── auth-service.yaml
      ├── user-service.yaml
      ├── product-service.yaml
STEP 15.1

Create

auth-service.yaml
apiVersion: v1
kind: Service

metadata:
  name: auth-service

spec:

  selector:
    app: auth

  ports:
    - protocol: TCP
      port: 3000
      targetPort: 3000

  type: ClusterIP

Save.

STEP 15.2

Create

user-service.yaml
apiVersion: v1
kind: Service

metadata:
  name: user-service

spec:

  selector:
    app: user

  ports:
    - protocol: TCP
      port: 3001
      targetPort: 3001

  type: ClusterIP

Save.

STEP 15.3

Create

product-service.yaml
apiVersion: v1
kind: Service

metadata:
  name: product-service

spec:

  selector:
    app: product

  ports:
    - protocol: TCP
      port: 3002
      targetPort: 3002

  type: ClusterIP

Save.

STEP 15.4

Deploy all Services

kubectl apply -f auth-service.yaml
kubectl apply -f user-service.yaml
kubectl apply -f product-service.yaml
STEP 15.5

Verify

kubectl get svc

Expected

NAME              TYPE        PORT

auth-service      ClusterIP

user-service      ClusterIP

product-service   ClusterIP

kubernetes
STEP 15.6

Describe

kubectl describe svc auth-service

Observe

Selector

Endpoints

ClusterIP
STEP 15.7

Describe User Service

kubectl describe svc user-service
STEP 15.8

Describe Product Service

kubectl describe svc product-service
STEP 16 — Verify Pod Communication

Get pods

kubectl get pods

Example

user-deployment-xxxxx

Open terminal

kubectl exec -it user-deployment-xxxxx -- sh

Now you are inside Linux.

STEP 16.1

Check DNS

nslookup auth-service

Expected

Name: auth-service

Address: 10.x.x.x
STEP 16.2

Call Auth Service

wget -qO- http://auth-service:3000

Expected

Auth Service
STEP 16.3

Call Product Service

wget -qO- http://product-service:3002

Expected

Product Service
STEP 17

Modify User Service

Install Axios if not already installed.

npm install axios

Update index.js:

const express = require("express");
const axios = require("axios");

const app = express();

app.get("/", (req, res) => {
    res.send("User Service");
});

app.get("/details", async (req, res) => {

    const auth = await axios.get("http://auth-service:3000");

    const product = await axios.get("http://product-service:3002");

    res.json({
        auth: auth.data,
        product: product.data
    });

});

app.listen(3001);
STEP 18

Rebuild image

docker build -t user-service:v2 .

Tag

docker tag user-service:v2 firdousalam2058/user-service:v2

Push

docker push firdousalam2058/user-service:v2

Update Deployment

user-service:v2

Apply

kubectl apply -f user-deployment.yaml
STEP 19

Install NGINX Ingress

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml

Wait

kubectl get pods -n ingress-nginx

All pods should become Running.

STEP 20

Create

ingress.yaml

We'll do this after verifying that the Services work correctly.

Learning Outcome

By the end of this project, you'll understand:

Docker image creation and publishing
Kubernetes Deployments and rolling updates
Services and ClusterIP networking
Kubernetes DNS (auth-service, user-service, etc.)
Pod-to-pod communication
NGINX Ingress routing
Image updates and rolling deployments
Production-ready microservice architecture

I recommend progressing one step at a time: first create and verify the three *-service.yaml files and confirm kubectl get svc shows all three services before moving on to inter-service communication and Ingress.