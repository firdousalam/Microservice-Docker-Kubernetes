Chapter 5 – Kubernetes Deployments & Services
Building Production-Ready Node.js Microservices using Docker, Kubernetes, Helm & CI/CD
Chapter Overview

In the previous chapter, we containerized our three Node.js microservices and pushed the Docker images to Docker Hub.

Now it's time to deploy them to Kubernetes.

In this chapter, you'll learn how to:

Understand Kubernetes architecture
Create Deployments
Create Services
Expose applications inside the cluster
Use Kubernetes DNS
Verify Pods
Troubleshoot common deployment issues
Deploy the Auth, User, and Product services

This chapter includes the exact issues we encountered during our implementation and how we resolved them.

What is Kubernetes?

Docker packages applications into containers.

Kubernetes manages those containers.

Instead of manually starting and stopping containers, Kubernetes automatically:

Deploys applications
Restarts failed containers
Scales applications
Performs rolling updates
Provides networking
Performs service discovery
Load balances traffic
Kubernetes Architecture
                    Kubernetes Cluster
                           │
     ┌─────────────────────┴─────────────────────┐
     │                                           │
 Master Node                               Worker Node
     │                                           │
 API Server                              Pods
 Scheduler                               Containers
 Controller Manager                      Services
 etcd

For local development, Docker Desktop provides a single-node Kubernetes cluster.

Step 1 – Enable Kubernetes in Docker Desktop

Open:

Docker Desktop

Navigate to:

Settings
    ↓
Kubernetes

Enable:

✔ Enable Kubernetes

Click:

Apply & Restart

Wait until Kubernetes shows:

Running
Step 2 – Verify Installation

Check Docker:

docker version

Check kubectl:

kubectl version --client

Example:

Client Version: v1.36.1
Step 3 – Verify Kubernetes Context
kubectl config current-context

Expected:

docker-desktop

List contexts:

kubectl config get-contexts

Expected:

CURRENT   NAME

*         docker-desktop
Step 4 – Verify Cluster
kubectl get nodes

Expected:

NAME

docker-desktop
Problem We Faced

Initially:

Unable to connect to the server

dial tcp 127.0.0.1:6443

connection refused

Later:

couldn't get current server API group list

EOF
Cause

Kubernetes was not fully started inside Docker Desktop.

Solution
Restart Docker Desktop.
Ensure Kubernetes is enabled.
Wait for Kubernetes to become Running.
Retry:
kubectl get nodes
Step 5 – Create the Kubernetes Folder
Microservice-Docker-Kubernetes

│
├── auth-service
├── user-service
├── product-service
│
└── k8s

Move into it:

cd k8s
Step 6 – Auth Deployment

Create:

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

        image: firdousalam2058/auth-service:v1

        imagePullPolicy: Always

        ports:
        - containerPort: 3000
Step 7 – Apply Deployment
kubectl apply -f auth-deployment.yaml

Verify:

kubectl get deployments
Step 8 – User Deployment

Create:

user-deployment.yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: user-deployment

spec:
  replicas: 1

  selector:
    matchLabels:
      app: user

  template:

    metadata:
      labels:
        app: user

    spec:

      containers:

      - name: user

        image: firdousalam2058/user-service:v1

        imagePullPolicy: Always

        ports:
        - containerPort: 3001

Apply:

kubectl apply -f user-deployment.yaml
Step 9 – Product Deployment

Create:

product-deployment.yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: product-deployment

spec:
  replicas: 1

  selector:
    matchLabels:
      app: product

  template:

    metadata:
      labels:
        app: product

    spec:

      containers:

      - name: product

        image: firdousalam2058/product-service:v1

        imagePullPolicy: Always

        ports:
        - containerPort: 3002

Apply:

kubectl apply -f product-deployment.yaml
Step 10 – Verify Pods
kubectl get pods

Expected:

auth-deployment-xxxx

user-deployment-xxxx

product-deployment-xxxx

All should eventually show:

Running
Issue We Faced — ErrImageNeverPull

Initially, all pods failed with:

ErrImageNeverPull

Pods:

auth

user

product

were stuck in:

Pending
Root Cause

Our Deployment YAML used:

imagePullPolicy: Never

Kubernetes tried to use a local image that was not available to the cluster.

Solution

We updated the deployment to use Docker Hub images:

image: firdousalam2058/auth-service:v1

imagePullPolicy: Always

Then rebuilt, tagged, and pushed the images:

docker build -t auth-service:v1 .

docker tag auth-service:v1 firdousalam2058/auth-service:v1

docker push firdousalam2058/auth-service:v1

Finally, restart the deployment:

kubectl rollout restart deployment auth-deployment

Repeat the same for the User and Product services.

Step 11 – Create Services

A Deployment creates Pods, but Pods have dynamic IP addresses. A Kubernetes Service provides a stable endpoint and DNS name for accessing them.

Auth Service

Create:

auth-service.yaml
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

  type: ClusterIP

Apply:

kubectl apply -f auth-service.yaml
User Service

Create:

user-service.yaml
apiVersion: v1
kind: Service

metadata:
  name: user-service

spec:
  selector:
    app: user

  ports:
    - port: 3001
      targetPort: 3001

  type: ClusterIP

Apply:

kubectl apply -f user-service.yaml
Product Service

Create:

product-service.yaml
apiVersion: v1
kind: Service

metadata:
  name: product-service

spec:
  selector:
    app: product

  ports:
    - port: 3002
      targetPort: 3002

  type: ClusterIP

Apply:

kubectl apply -f product-service.yaml
Step 12 – Verify Services
kubectl get svc

Expected:

NAME              TYPE        PORT(S)

auth-service      ClusterIP   3000/TCP

user-service      ClusterIP   3001/TCP

product-service   ClusterIP   3002/TCP
Step 13 – Test Internal DNS

Open a shell in one of the Pods:

kubectl exec -it <user-pod-name> -- sh

Check DNS resolution:

nslookup auth-service

Expected output:

Name:
auth-service.default.svc.cluster.local

Address:
10.xx.xx.xx

This confirms that Kubernetes DNS is functioning correctly.

Step 14 – Call One Service from Another

Inside the User Service code, instead of calling localhost, use the Kubernetes service DNS name:

const AUTH_SERVICE_URL = "http://auth-service:3000";

Example:

const axios = require("axios");

const response = await axios.get(
  "http://auth-service:3000/auth"
);

console.log(response.data);

Kubernetes automatically resolves auth-service to the correct Pod through the Service.

Step 15 – Verify Resources

Useful commands:

kubectl get all
kubectl get pods
kubectl get deployments
kubectl get svc
Step 16 – Common Commands

Describe a Pod:

kubectl describe pod <pod-name>

View logs:

kubectl logs <pod-name>

Delete a Pod (Deployment recreates it automatically):

kubectl delete pod <pod-name>

Restart a Deployment:

kubectl rollout restart deployment auth-deployment

Check rollout status:

kubectl rollout status deployment auth-deployment
Common Issues We Solved
1. kubectl exec Command Failed

We accidentally typed:

> kubectl exec -it user-deployment-xxxx -- sh

PowerShell interpreted > as redirection and returned:

The term '>' is not recognized

Solution:

Run the command without the >:

kubectl exec -it <pod-name> -- sh
2. auth-service.yaml Not Found

Error:

error: the path "auth-service.yaml" does not exist

Cause:

The YAML file was not created or the filename was incorrect.

Solution:

Create the file in the k8s directory and re-run:

kubectl apply -f auth-service.yaml
3. no objects passed to apply

Error:

error: no objects passed to apply

Cause:

The YAML file was empty or invalid.

Solution:

Add the complete Service definition and apply it again.

4. Deployment Not Found

Error:

Error from server (NotFound): deployments.apps "auth-deployment" not found

Cause:

The Deployment had been deleted or was applied in a different namespace.

Solution:

Reapply the Deployment:

kubectl apply -f auth-deployment.yaml
5. Pod Not Found

Error:

error: pods "auth-pod" not found

Cause:

Deployment-managed Pods have generated names (for example, auth-deployment-79479949d8-qvl48).

Solution:

List Pods first:

kubectl get pods

Then use the exact Pod name:

kubectl logs auth-deployment-79479949d8-qvl48
Best Practices
Use Deployments instead of creating Pods directly.
Expose Pods using Services rather than Pod IPs.
Refer to services by their DNS names (e.g., http://auth-service:3000) instead of hard-coded IP addresses.
Keep Deployment and Service YAML files separate for clarity.
Use versioned Docker images (v1, v2, etc.) for predictable deployments.
Verify each step with kubectl get pods and kubectl get svc before proceeding.
Verify Before Moving On

Before continuing to the next chapter, ensure:

✅ Kubernetes cluster is running.
✅ Three Deployments are created.
✅ Three Pods are in the Running state.
✅ Three ClusterIP Services are created.
✅ Internal DNS resolves service names successfully.
✅ Microservices can communicate using Kubernetes service names instead of localhost.
Chapter Summary

In this chapter, we deployed the Auth, User, and Product microservices to Kubernetes using Deployments and exposed them internally using ClusterIP Services. We also explored Kubernetes DNS, learned how services communicate within the cluster, and resolved several real-world deployment issues, including ErrImageNeverPull, missing YAML files, and pod naming confusion.

What's Next?

In Chapter 6 – Kubernetes Ingress & External Access, we'll install the NGINX Ingress Controller, create Ingress resources, expose all three microservices through a single entry point, and troubleshoot why http://localhost/user didn't initially work on Docker Desktop and how we resolved it using port forwarding.