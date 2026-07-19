# 📖 Chapter 5 – Kubernetes Deployments & Services

> **Series:** Building Production-Ready Node.js Microservices using Docker, Kubernetes, Helm & CI/CD

---

# 📚 Chapter Overview

In the previous chapter, we containerized our three Node.js microservices and published the Docker images to Docker Hub.

Now it's time to deploy them to **Kubernetes**.

In this chapter, you will learn how to:

- Understand Kubernetes architecture
- Create Deployments
- Create Services
- Expose applications inside the cluster
- Use Kubernetes DNS for service discovery
- Verify Pods and Services
- Troubleshoot common deployment issues
- Deploy the Auth, User, and Product microservices

This chapter also includes the real-world issues encountered during implementation and the solutions used to resolve them.

---

# 🎯 Learning Objectives

By the end of this chapter, you will be able to:

- Deploy Docker images to Kubernetes
- Create Kubernetes Deployments
- Create ClusterIP Services
- Understand Pod lifecycle
- Use Kubernetes DNS
- Verify deployments and services
- Troubleshoot deployment failures
- Enable communication between microservices

---

# ☸️ What is Kubernetes?

Docker packages applications into containers.

Kubernetes manages those containers.

Instead of manually starting and stopping containers, Kubernetes automatically:

- Deploys applications
- Restarts failed containers
- Scales applications
- Performs rolling updates
- Provides networking
- Performs service discovery
- Load balances traffic

---

# 🏗 Kubernetes Architecture

```text
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
```

For local development, Docker Desktop provides a **single-node Kubernetes cluster**.

---

# 🚀 Step 1 – Enable Kubernetes in Docker Desktop

Open Docker Desktop and navigate to:

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

Wait until Kubernetes reports:

```text
Running
```

---

# 🔍 Step 2 – Verify Installation

Verify Docker:

```bash
docker version
```

Verify kubectl:

```bash
kubectl version --client
```

Example:

```text
Client Version: v1.36.1
```

---

# 🌐 Step 3 – Verify Kubernetes Context

Check the current context:

```bash
kubectl config current-context
```

Expected:

```text
docker-desktop
```

List contexts:

```bash
kubectl config get-contexts
```

Expected:

```text
CURRENT   NAME

*         docker-desktop
```

---

# ✅ Step 4 – Verify Cluster

```bash
kubectl get nodes
```

Expected:

```text
NAME               STATUS

docker-desktop     Ready
```

---

# ⚠️ Problem We Faced

Initially, we encountered:

```text
Unable to connect to the server

dial tcp 127.0.0.1:6443

connection refused
```

Later, another error appeared:

```text
couldn't get current server API group list

EOF
```

### Cause

Kubernetes was not fully started inside Docker Desktop.

### Solution

1. Restart Docker Desktop.
2. Ensure Kubernetes is enabled.
3. Wait until Kubernetes status becomes **Running**.
4. Verify:

```bash
kubectl get nodes
```

---

# 📁 Step 5 – Create the Kubernetes Folder

Project structure:

```text
Microservice-Docker-Kubernetes
│
├── auth-service
├── user-service
├── product-service
│
└── k8s
```

Navigate to the Kubernetes directory:

```bash
cd k8s
```

---

# 🔐 Step 6 – Create the Auth Deployment

Create:

```text
auth-deployment.yaml
```

```yaml
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
```

Apply the deployment:

```bash
kubectl apply -f auth-deployment.yaml
```

Verify:

```bash
kubectl get deployments
```

---

# 👤 Step 7 – Create the User Deployment

Create:

```text
user-deployment.yaml
```

```yaml
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
```

Apply:

```bash
kubectl apply -f user-deployment.yaml
```

---

# 🛒 Step 8 – Create the Product Deployment

Create:

```text
product-deployment.yaml
```

```yaml
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
```

Apply:

```bash
kubectl apply -f product-deployment.yaml
```

---

# ✅ Step 9 – Verify Pods

```bash
kubectl get pods
```

Expected:

```text
auth-deployment-xxxx

user-deployment-xxxx

product-deployment-xxxx
```

All Pods should eventually reach the **Running** state.

---

# ⚠️ Issue We Faced – `ErrImageNeverPull`

Initially, all Pods failed with:

```text
ErrImageNeverPull
```

Pods remained in the **Pending** state.

### Root Cause

Our Deployment YAML used:

```yaml
imagePullPolicy: Never
```

Kubernetes attempted to use a local Docker image that was not available inside the cluster.

### Solution

Update the Deployment:

```yaml
image: firdousalam2058/auth-service:v1
imagePullPolicy: Always
```

Rebuild, tag, and push the image:

```bash
docker build -t auth-service:v1 .

docker tag auth-service:v1 firdousalam2058/auth-service:v1

docker push firdousalam2058/auth-service:v1
```

Restart the Deployment:

```bash
kubectl rollout restart deployment auth-deployment
```

Repeat the same process for the User and Product services.

---

# 🌐 Step 10 – Create Kubernetes Services

Pods have dynamic IP addresses. A **Service** provides a stable endpoint and DNS name.

## Auth Service

```yaml
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
```

Apply:

```bash
kubectl apply -f auth-service.yaml
```

---

## User Service

```yaml
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
```

Apply:

```bash
kubectl apply -f user-service.yaml
```

---

## Product Service

```yaml
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
```

Apply:

```bash
kubectl apply -f product-service.yaml
```

---

# 🔍 Step 11 – Verify Services

```bash
kubectl get svc
```

Expected:

```text
NAME              TYPE        PORT(S)

auth-service      ClusterIP   3000/TCP

user-service      ClusterIP   3001/TCP

product-service   ClusterIP   3002/TCP
```

---

# 🌐 Step 12 – Test Kubernetes DNS

Open a shell inside one of the Pods:

```bash
kubectl exec -it <user-pod-name> -- sh
```

Verify DNS resolution:

```bash
nslookup auth-service
```

Expected:

```text
Name:
auth-service.default.svc.cluster.local

Address:
10.xx.xx.xx
```

This confirms Kubernetes DNS is functioning correctly.

---

# 🔄 Step 13 – Service-to-Service Communication

Instead of calling `localhost`, use the Kubernetes Service name:

```javascript
const AUTH_SERVICE_URL = "http://auth-service:3000";
```

Example:

```javascript
const axios = require("axios");

const response = await axios.get(
  "http://auth-service:3000/auth"
);

console.log(response.data);
```

Kubernetes automatically resolves `auth-service` to the appropriate Pod.

---

# 📋 Step 14 – Verify Resources

Useful commands:

```bash
kubectl get all

kubectl get pods

kubectl get deployments

kubectl get svc
```

---

# 🛠 Step 15 – Useful Kubernetes Commands

Describe a Pod:

```bash
kubectl describe pod <pod-name>
```

View logs:

```bash
kubectl logs <pod-name>
```

Delete a Pod (Deployment recreates it automatically):

```bash
kubectl delete pod <pod-name>
```

Restart a Deployment:

```bash
kubectl rollout restart deployment auth-deployment
```

Check rollout status:

```bash
kubectl rollout status deployment auth-deployment
```

---

# ⚠️ Common Issues We Solved

## 1. `kubectl exec` Command Failed

Incorrect command:

```powershell
> kubectl exec -it user-deployment-xxxx -- sh
```

PowerShell interpreted `>` as redirection.

### Solution

```bash
kubectl exec -it <pod-name> -- sh
```

---

## 2. `auth-service.yaml` Not Found

Error:

```text
error: the path "auth-service.yaml" does not exist
```

### Solution

Create the file in the `k8s` directory and reapply it:

```bash
kubectl apply -f auth-service.yaml
```

---

## 3. No Objects Passed to Apply

Error:

```text
error: no objects passed to apply
```

### Cause

The YAML file was empty or invalid.

### Solution

Add a valid Kubernetes manifest and apply it again.

---

## 4. Deployment Not Found

Error:

```text
Error from server (NotFound):
deployments.apps "auth-deployment" not found
```

### Solution

Reapply the Deployment:

```bash
kubectl apply -f auth-deployment.yaml
```

---

## 5. Pod Not Found

Error:

```text
error: pods "auth-pod" not found
```

### Cause

Deployment-managed Pods have generated names.

Example:

```text
auth-deployment-79479949d8-qvl48
```

List Pods:

```bash
kubectl get pods
```

Use the exact Pod name:

```bash
kubectl logs auth-deployment-79479949d8-qvl48
```

---

# 💡 Best Practices

- Use Deployments instead of standalone Pods.
- Expose applications using Services.
- Use Kubernetes DNS instead of hardcoded IP addresses.
- Keep Deployment and Service YAML files separate.
- Use versioned Docker image tags.
- Verify each deployment using `kubectl get pods` and `kubectl get svc`.

---

# ✅ Verify Before Moving On

Ensure the following:

- ✅ Kubernetes cluster is running
- ✅ Three Deployments are created
- ✅ Three Pods are in the Running state
- ✅ Three ClusterIP Services are created
- ✅ Kubernetes DNS resolves service names
- ✅ Microservices communicate using Service names

---

# 📚 Chapter Summary

In this chapter, we deployed the Auth, User, and Product microservices to Kubernetes using **Deployments** and exposed them internally with **ClusterIP Services**.

We also learned how Kubernetes DNS enables service discovery and resolved several real-world deployment issues, including:

- `ErrImageNeverPull`
- Missing YAML files
- Empty manifests
- Deployment recreation
- Pod naming confusion

These concepts form the foundation for running production-ready applications on Kubernetes.

---

---

# 💡 Understanding `NXDOMAIN` During `nslookup`

When testing Kubernetes DNS, you may see output similar to the following:

```bash
kubectl exec -it <pod-name> -- sh

nslookup auth-service
```

Output:

```text
Server:         10.96.0.10
Address:        10.96.0.10:53

** server can't find auth-service.cluster.local: NXDOMAIN

** server can't find auth-service.svc.cluster.local: NXDOMAIN

Name:   auth-service.default.svc.cluster.local
Address: 10.96.164.145
```

### Does this mean Kubernetes DNS is broken?

**No.**

This is normal behavior when using the BusyBox `nslookup` utility that is included in many Alpine-based Docker images.

BusyBox attempts to resolve the service name using several search domains.

It tries:

```text
auth-service.cluster.local
```

❌ Not found

Then:

```text
auth-service.svc.cluster.local
```

❌ Not found

Finally:

```text
auth-service.default.svc.cluster.local
```

✅ Successfully resolved

```text
Name:   auth-service.default.svc.cluster.local
Address: 10.96.164.145
```

The earlier `NXDOMAIN` messages simply indicate that those shorter search paths do not exist. The final successful lookup confirms that Kubernetes DNS is working correctly.

---

## Verify DNS Configuration

Inside any Pod, run:

```bash
cat /etc/resolv.conf
```

Expected output:

```text
search default.svc.cluster.local svc.cluster.local cluster.local
nameserver 10.96.0.10
```

This confirms that the Pod is configured to use the Kubernetes DNS server.

---

## Verify Service Connectivity

DNS resolution alone is not enough. You should also verify that the service is reachable.

Run:

```bash
wget -qO- http://auth-service:3000/auth
```

or, if `curl` is available:

```bash
curl http://auth-service:3000/auth
```

Expected response:

```text
Auth Service Running
```

If this request succeeds, then:

- ✅ Kubernetes DNS is working.
- ✅ The ClusterIP Service is functioning.
- ✅ The Auth Pod is reachable.
- ✅ Service-to-Service communication is configured correctly.

---

> **Note:** Seeing `NXDOMAIN` before a successful lookup is expected when using BusyBox `nslookup`. As long as the service ultimately resolves to an address such as `auth-service.default.svc.cluster.local` and your application is reachable, Kubernetes DNS is functioning correctly.

# 🚀 What's Next?

In **Chapter 6 – Kubernetes Ingress & External Access**, we will:

- Install the NGINX Ingress Controller
- Create Ingress resources
- Expose all three microservices through a single entry point
- Troubleshoot why `http://localhost/user` initially didn't work on Docker Desktop
- Configure port forwarding and verify external access

This is where we'll make our Kubernetes applications accessible from outside the cluster.

---

## 📌 End of Chapter 5

Congratulations! 🎉

You have successfully deployed your Node.js microservices to Kubernetes and enabled internal communication using Kubernetes Services and DNS. Your application is now ready for external access using NGINX Ingress.