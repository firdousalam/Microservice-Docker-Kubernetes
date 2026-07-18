# 📖 Chapter 6 – Kubernetes Ingress & Networking

> **Series:** Building Production-Ready Node.js Microservices using Docker, Kubernetes, Helm & CI/CD

---

# 📚 Chapter Overview

In the previous chapter, we successfully deployed our three Node.js microservices to Kubernetes using **Deployments** and **ClusterIP Services**. While the services could communicate with each other inside the cluster, they were not directly accessible from a web browser.

In this chapter, we'll expose all three services through a **single entry point** using the **NGINX Ingress Controller**. We'll also explore Kubernetes networking, configure path-based routing, and troubleshoot the exact networking issues we encountered during implementation.

By the end of this chapter, you will be able to:

- Understand Kubernetes networking
- Learn the role of an Ingress Controller
- Install the NGINX Ingress Controller
- Create an Ingress resource
- Route requests to multiple services
- Access services from a browser
- Troubleshoot common networking issues

---

# 🎯 Learning Objectives

After completing this chapter, you will understand how to:

- Install an NGINX Ingress Controller
- Create Kubernetes Ingress resources
- Route requests using URL paths
- Access multiple services through a single endpoint
- Understand request flow inside Kubernetes
- Troubleshoot Ingress and networking issues
- Verify Ingress resources and backend services

---

# 🌐 Kubernetes Networking

Every Pod receives its own IP address, but Pod IPs are **temporary**. Whenever a Pod is recreated, its IP address changes.

Kubernetes solves this by introducing **Services**, which provide:

- Stable IP addresses
- Stable DNS names
- Internal load balancing

To expose services outside the cluster, Kubernetes uses **Ingress**.

```text
              Browser
                 │
                 ▼
      NGINX Ingress Controller
                 │
      ┌──────────┼──────────┐
      ▼          ▼          ▼
 Auth Service  User Service Product Service
```

---

# ❓ Why Do We Need Ingress?

### Without Ingress

- Every service requires its own NodePort or LoadBalancer.
- Managing multiple URLs becomes difficult.
- SSL configuration must be repeated for each service.
- Routing logic becomes complex.

### With Ingress

- One entry point
- Path-based routing
- Host-based routing
- SSL termination
- Built-in load balancing

Example URLs:

```text
http://localhost/auth
http://localhost/user
http://localhost/product
```

---

# 🚀 Step 1 – Install the NGINX Ingress Controller

Docker Desktop includes Kubernetes, but an **Ingress Controller** must be installed separately.

Install it using the official manifest:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
```

> **Note:** The installation may take several minutes while Kubernetes downloads the required images.

---

# 🔍 Step 2 – Verify the Ingress Controller

Check the Ingress Controller Pods:

```bash
kubectl get pods -n ingress-nginx
```

Expected output:

```text
NAME                                         READY   STATUS

ingress-nginx-controller-xxxxxxxxxx          1/1     Running
```

### During Our Implementation

Initially:

```text
STATUS

ContainerCreating
```

After a few minutes:

```text
STATUS

Running
```

---

# 🌐 Step 3 – Verify the Ingress Service

```bash
kubectl get svc -n ingress-nginx
```

Expected:

```text
NAME                         TYPE

ingress-nginx-controller      LoadBalancer
```

During our implementation:

```text
EXTERNAL-IP

<pending>
```

> **Important:** This is expected on Docker Desktop because there is no cloud provider available to provision an external LoadBalancer.

---

# 📝 Step 4 – Create the Ingress Resource

Create:

```text
k8s/ingress.yaml
```

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress

metadata:
  name: microservice-ingress

spec:
  ingressClassName: nginx

  rules:
    - host: localhost

      http:
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
```

Apply:

```bash
kubectl apply -f ingress.yaml
```

---

# ✅ Step 5 – Verify the Ingress

```bash
kubectl get ingress
```

Expected:

```text
NAME                    CLASS   HOSTS

microservice-ingress    nginx   localhost
```

Describe the resource:

```bash
kubectl describe ingress microservice-ingress
```

Expected:

```text
/auth      auth-service:3000
/user      user-service:3001
/product   product-service:3002
```

This confirms that all routing rules have been configured correctly.

---

# ⚠️ Step 6 – Why `http://localhost/user` Didn't Work

Initially, when we opened:

```text
http://localhost/user
```

The browser displayed:

```text
This localhost page can't be found
```

Even though:

- ✅ Pods were running
- ✅ Services existed
- ✅ Ingress rules were correct
- ✅ Ingress Controller was running

### Root Cause

On Docker Desktop, the Ingress Controller is **not automatically exposed on the host machine's port 80**.

The Ingress exists inside the Kubernetes cluster, but the host operating system cannot reach it directly.

---

# 🔄 Step 7 – Use Port Forwarding

Forward the Ingress Controller service:

```bash
kubectl port-forward -n ingress-nginx service/ingress-nginx-controller 8080:80
```

Expected output:

```text
Forwarding from 127.0.0.1:8080 -> 80
Forwarding from [::1]:8080 -> 80
```

> **Keep this terminal window open** while testing the application.

---

# 🌍 Step 8 – Test the Routes

Open the following URLs:

### Auth Service

```text
http://localhost:8080/auth
```

Response:

```text
Auth Service Running
```

---

### User Service

```text
http://localhost:8080/user
```

Response:

```text
User Service Running
```

---

### Product Service

```text
http://localhost:8080/product
```

Response:

```text
Product Service Running
```

During our implementation, all three routes worked successfully after enabling port forwarding.

---

# 🔄 Step 9 – Understanding the Request Flow

```text
           Browser
              │
              ▼
      localhost:8080
              │
              ▼
   NGINX Ingress Controller
              │
     ┌────────┼────────┐
     ▼        ▼        ▼
  Auth     User     Product
 Service   Service   Service
```

Each incoming request is matched against the configured path and forwarded to the appropriate Kubernetes Service.

---

# 🛠 Useful Networking Commands

List Ingress resources:

```bash
kubectl get ingress
```

Describe an Ingress:

```bash
kubectl describe ingress microservice-ingress
```

View the Ingress Controller Pods:

```bash
kubectl get pods -n ingress-nginx
```

View Controller logs:

```bash
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

List Services:

```bash
kubectl get svc
```

Check Endpoints:

```bash
kubectl get endpoints
```

---

# ⚠️ Common Issues We Solved

## 1. Ingress Controller Stuck in `ContainerCreating`

Observed:

```text
STATUS

ContainerCreating
```

### Cause

The container image was still downloading or Kubernetes was still initializing.

### Solution

Wait a few minutes and verify again:

```bash
kubectl get pods -n ingress-nginx
```

Eventually:

```text
Running
```

---

## 2. `EXTERNAL-IP` Stayed `<pending>`

Observed:

```text
LoadBalancer

EXTERNAL-IP

<pending>
```

### Cause

Docker Desktop does not provide a cloud-based LoadBalancer.

### Solution

Use port forwarding:

```bash
kubectl port-forward -n ingress-nginx service/ingress-nginx-controller 8080:80
```

---

## 3. `http://localhost/user` Returned 404

The browser displayed:

```text
This localhost page can't be found
```

### Cause

The Ingress Controller was not exposed on the host's port 80.

### Solution

Use the forwarded port:

```text
http://localhost:8080/user
```

---

## 4. Verify Backend Services

If routing fails, verify the Services:

```bash
kubectl get svc
```

Expected:

```text
auth-service
user-service
product-service
```

---

## 5. Verify Pods

```bash
kubectl get pods
```

All Pods should show:

```text
Running
```

---

## 6. Verify Ingress Rules

```bash
kubectl describe ingress microservice-ingress
```

Ensure the backend mappings are correct:

```text
/auth     → auth-service:3000
/user     → user-service:3001
/product  → product-service:3002
```

---

# 💡 Best Practices

- Use an Ingress instead of exposing every service individually.
- Keep backend Services as **ClusterIP**.
- Use meaningful paths such as `/auth`, `/user`, and `/product`.
- Verify Pods, Services, and Ingress resources before troubleshooting.
- For Docker Desktop, use `kubectl port-forward` when a LoadBalancer external IP is unavailable.
- Keep all Ingress routing rules in a single manifest for easier management.

---

# ✅ Verify Before Moving On

Before continuing, ensure:

- ✅ NGINX Ingress Controller is installed
- ✅ Controller Pod is in the **Running** state
- ✅ Three ClusterIP Services exist
- ✅ The Ingress resource has been created successfully
- ✅ Port forwarding is active
- ✅ `http://localhost:8080/auth` works
- ✅ `http://localhost:8080/user` works
- ✅ `http://localhost:8080/product` works

---

# 📚 Chapter Summary

In this chapter, we configured Kubernetes networking using the **NGINX Ingress Controller**. We installed the controller, created an Ingress resource, and routed browser requests to the Auth, User, and Product microservices through a single endpoint.

We also documented several real-world networking issues encountered during development, including:

- Ingress Controller stuck in `ContainerCreating`
- LoadBalancer `EXTERNAL-IP` remaining `<pending>`
- `http://localhost/user` returning a 404
- Exposing the Ingress Controller using `kubectl port-forward`

These troubleshooting steps mirror common issues developers face when using Kubernetes with Docker Desktop.

---

# 🚀 What's Next?

In **Chapter 7 – MongoDB Atlas, ConfigMaps & Secrets**, we will:

- Connect all three microservices to MongoDB Atlas
- Store configuration in Kubernetes ConfigMaps
- Secure sensitive data using Kubernetes Secrets
- Inject environment variables into Pods
- Replace hard-coded values with secure, production-ready configuration

---

## 📌 End of Chapter 6

Congratulations! 🎉

You have successfully configured Kubernetes networking and exposed your microservices through a single NGINX Ingress entry point. Your application is now accessible from a browser and is ready for secure configuration using ConfigMaps and Secrets.