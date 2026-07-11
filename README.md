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
