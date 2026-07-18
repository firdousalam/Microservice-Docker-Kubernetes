# Chapter 12 – Packaging the Application with Helm & Automating Deployments Using GitHub Actions CI/CD

> **Building Production-Ready Node.js Microservices using Docker, Kubernetes, Helm & CI/CD**

---

# Chapter Overview

Congratulations! 🎉

By this stage, you have successfully built a complete production-style microservices application.

Your project now includes:

- ✅ Three Node.js Microservices
- ✅ Docker
- ✅ Docker Hub
- ✅ Kubernetes Deployments
- ✅ Kubernetes Services
- ✅ NGINX Ingress
- ✅ MongoDB Atlas
- ✅ Kubernetes Secrets & ConfigMaps
- ✅ JWT Authentication
- ✅ Health Checks
- ✅ Horizontal Pod Autoscaler (HPA)
- ✅ Rolling Updates
- ✅ Prometheus & Grafana Monitoring

Your application is now **production-ready**.

However, imagine managing **20 or 50 microservices**.

Deploying every service manually would require running commands like:

```bash
kubectl apply -f auth-deployment.yaml
kubectl apply -f auth-service.yaml

kubectl apply -f user-deployment.yaml
kubectl apply -f user-service.yaml

kubectl apply -f product-deployment.yaml
kubectl apply -f product-service.yaml

kubectl apply -f ingress.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml
```

This quickly becomes difficult to maintain.

Production teams solve this by using:

- **Helm** for packaging Kubernetes resources
- **GitHub Actions** for automating builds and deployments

By the end of this chapter, you'll have:

- A single command to deploy your application.
- A complete CI/CD pipeline that automatically builds Docker images, pushes them to Docker Hub, and deploys changes whenever code is pushed to GitHub.

---

# Why Helm?

Helm is the **package manager for Kubernetes**.

Instead of maintaining dozens of YAML files, Helm bundles everything into a reusable **Chart**.

## Benefits

- Reusable deployments
- Environment-specific configurations
- Easy upgrades
- Easy rollbacks
- Parameterized values
- Version-controlled deployments

---

# Project Structure

```text
Microservice-Docker-Kubernetes/
│
├── auth-service/
├── user-service/
├── product-service/
│
├── k8s/
│
├── helm/
│   └── microservices/
│       ├── Chart.yaml
│       ├── values.yaml
│       ├── .helmignore
│       └── templates/
│           ├── auth-deployment.yaml
│           ├── auth-service.yaml
│           ├── user-deployment.yaml
│           ├── user-service.yaml
│           ├── product-deployment.yaml
│           ├── product-service.yaml
│           ├── ingress.yaml
│           ├── secret.yaml
│           └── configmap.yaml
│
└── .github/
    └── workflows/
        └── deploy.yml
```

---

# Step 1 – Install Helm

Verify Helm installation:

```bash
helm version
```

Example:

```text
version.BuildInfo{
Version:"v4.2.3"
}
```

If Helm isn't installed:

### Windows

```bash
winget install Helm.Helm
```

Verify again:

```bash
helm version
```

---

# Step 2 – Create a Helm Chart

Create a new Helm chart:

```bash
mkdir helm

cd helm

helm create microservices
```

Helm generates:

```text
microservices/
├── Chart.yaml
├── values.yaml
└── templates/
```

---

# Step 3 – Remove Default Templates

Helm generates several default templates that aren't required for this project.

Generated files:

```text
templates/
├── NOTES.txt
├── serviceaccount.yaml
├── hpa.yaml
├── ingress.yaml
├── _helpers.tpl
└── tests/
```

Delete the unnecessary files:

- NOTES.txt
- serviceaccount.yaml
- hpa.yaml
- _helpers.tpl
- tests/

This avoids errors such as:

```text
INSTALLATION FAILED

microservices/templates/tests/test-connection.yaml

nil pointer evaluating interface {}.port
```

## Real Issue We Encountered

The generated `test-connection.yaml` referenced:

```yaml
.Values.service.port
```

But our `values.yaml` defined separate sections:

- auth
- user
- product

Removing the unused `templates/tests/` directory resolved the issue.

---

# Step 4 – Create values.yaml

Store configurable values inside `values.yaml` instead of hardcoding them.

Example:

```yaml
auth:
  image: firdousalam2058/auth-service:v7
  replicas: 1
  port: 3000

user:
  image: firdousalam2058/user-service:v7
  replicas: 1
  port: 3001

product:
  image: firdousalam2058/product-service:v7
  replicas: 1
  port: 3002
```

These values can later be overridden for Development, Staging, and Production environments.

---

# Step 5 – Convert Kubernetes YAML Files into Helm Templates

Copy your existing Kubernetes manifests into the Helm `templates/` directory.

Example:

```text
k8s/
└── auth-deployment.yaml

↓

helm/microservices/templates/
└── auth-deployment.yaml
```

Repeat for:

- auth-service.yaml
- user-deployment.yaml
- user-service.yaml
- product-deployment.yaml
- product-service.yaml
- ingress.yaml
- secret.yaml
- configmap.yaml

---

# Step 6 – Replace Hardcoded Values

Replace only configurable values with Helm expressions.

### Before

```yaml
spec:
  replicas: 1

containers:
- name: auth
  image: firdousalam2058/auth-service:v7
```

### After

```yaml
spec:
  replicas: {{ .Values.auth.replicas }}

containers:
- name: auth
  image: {{ .Values.auth.image }}
```

Update the Service:

```yaml
ports:
- port: {{ .Values.auth.port }}
  targetPort: {{ .Values.auth.port }}
```

Repeat for the User and Product services.

---

# Step 7 – Validate the Helm Chart

Validate your chart:

```bash
helm lint ./helm/microservices
```

Render templates locally:

```bash
helm template microservice-app ./helm/microservices
```

Review the generated manifests to ensure values are rendered correctly.

---

# Step 8 – Install the Helm Chart

Install the application:

```bash
helm install microservice-app ./helm/microservices
```

Verify:

```bash
helm list
```

Expected:

```text
NAME
microservice-app
```

---

# Step 9 – Upgrade the Release

Whenever you update:

- Images
- Replica counts
- Ports
- ConfigMaps
- Secrets

Run:

```bash
helm upgrade microservice-app ./helm/microservices
```

Helm updates only the changed resources.

---

# Step 10 – Uninstall the Application

Remove everything managed by Helm:

```bash
helm uninstall microservice-app
```

This removes:

- Deployments
- Services
- Ingress
- ConfigMaps
- Secrets

---

# GitHub Actions CI/CD

CI/CD stands for:

- **Continuous Integration (CI)** – Automatically build and test every code change.
- **Continuous Deployment (CD)** – Automatically deploy successful builds.

Instead of manually rebuilding Docker images and updating Kubernetes, GitHub Actions performs these tasks automatically.

---

# CI/CD Workflow

```text
Developer
    │
git push
    │
    ▼
GitHub Repository
    │
    ▼
GitHub Actions
    │
    ├── Checkout Code
    ├── Install Node.js
    ├── Install Dependencies
    ├── Run Tests
    ├── Build Docker Images
    ├── Push Images to Docker Hub
    ├── Update Kubernetes Deployment
    └── Verify Rollout
            │
            ▼
     Kubernetes Cluster
```

---

# Step 11 – Create the Workflow Directory

```text
.github/
└── workflows/
    └── deploy.yml
```

---

# Step 12 – Configure GitHub Secrets

Store sensitive information securely in GitHub.

| Secret | Purpose |
|---------|----------|
| DOCKER_USERNAME | Docker Hub username |
| DOCKER_PASSWORD | Docker Hub password or access token |
| KUBE_CONFIG | Base64-encoded kubeconfig |

> **Never hardcode credentials inside your workflow.**

---

# Step 13 – Create deploy.yml

A typical workflow performs the following:

- Trigger on push to `main`
- Checkout source code
- Setup Node.js
- Install dependencies
- Run tests
- Build Docker images
- Login to Docker Hub
- Push Docker images
- Configure kubectl
- Deploy to Kubernetes
- Verify rollout

Example:

```yaml
name: Deploy Microservices

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Build Docker Images
        run: |
          docker build -t ${{ secrets.DOCKER_USERNAME }}/auth-service:latest ./auth-service
          docker build -t ${{ secrets.DOCKER_USERNAME }}/user-service:latest ./user-service
          docker build -t ${{ secrets.DOCKER_USERNAME }}/product-service:latest ./product-service

      - name: Push Docker Images
        run: |
          docker push ${{ secrets.DOCKER_USERNAME }}/auth-service:latest
          docker push ${{ secrets.DOCKER_USERNAME }}/user-service:latest
          docker push ${{ secrets.DOCKER_USERNAME }}/product-service:latest
```

You can extend the workflow by installing `kubectl`, loading the kubeconfig, and executing:

```bash
helm upgrade --install microservice-app ./helm/microservices
```

---

# Step 14 – Deploy Using Helm in CI/CD

Instead of multiple `kubectl apply` commands, use:

```bash
helm upgrade --install microservice-app ./helm/microservices
```

This command:

- Installs the application if it doesn't exist.
- Upgrades it if it already exists.

---

# Step 15 – Verify the Deployment

Check rollout status:

```bash
kubectl rollout status deployment auth-deployment
```

View running Pods:

```bash
kubectl get pods
```

Verify the deployed image:

```bash
kubectl describe pod <pod-name>
```

---

# Useful Commands

### Verify Helm

```bash
helm version
```

### Validate Chart

```bash
helm lint ./helm/microservices
```

### Render Templates

```bash
helm template microservice-app ./helm/microservices
```

### Install

```bash
helm install microservice-app ./helm/microservices
```

### Upgrade

```bash
helm upgrade microservice-app ./helm/microservices
```

### Upgrade or Install

```bash
helm upgrade --install microservice-app ./helm/microservices
```

### List Releases

```bash
helm list
```

### View Release Values

```bash
helm get values microservice-app
```

### Uninstall

```bash
helm uninstall microservice-app
```

---

# Common Issues We Encountered

## 1. nil pointer evaluating interface {}.port

### Cause

The default Helm test template referenced:

```yaml
.Values.service.port
```

while our `values.yaml` used:

- auth
- user
- product

### Solution

Remove the `templates/tests/` directory or update the test template.

---

## 2. Chart.yaml or values.yaml Missing

### Cause

The chart wasn't created properly.

### Solution

```bash
helm create microservices
```

Then copy your templates again.

---

## 3. Hardcoded Values Still Present

### Cause

Some manifests still contained fixed image names or replica counts.

### Solution

Replace them with Helm expressions:

```yaml
replicas: {{ .Values.auth.replicas }}
image: {{ .Values.auth.image }}
```

---

## 4. Helm Upgrade Doesn't Change Pods

### Cause

The image tag didn't change, so Kubernetes didn't detect a new version.

### Solution

Use a new image tag (for example, `v8`) or configure:

```yaml
imagePullPolicy: Always
```

during development.

---

# Best Practices

- Keep all configurable values in `values.yaml`.
- Use separate values files for Development, Staging, and Production.
- Store secrets in GitHub Secrets.
- Validate charts with `helm lint`.
- Test charts using `helm template`.
- Use `helm upgrade --install` in CI/CD pipelines.
- Tag Docker images with version numbers instead of always using `latest`.

---

# Final Project Architecture

```text
                    Browser
                        │
                        ▼
                 NGINX Ingress
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
   Auth Service     User Service   Product Service
        │               │               │
        └───────────────┼───────────────┘
                        ▼
                  MongoDB Atlas
                        │
                        ▼
              Kubernetes Cluster
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
      Secrets      ConfigMaps        HPA
                        │
                        ▼
               Prometheus & Grafana
                        │
                        ▼
                   Helm Chart
                        │
                        ▼
                GitHub Actions CI/CD
                        │
                        ▼
              Automated Deployments
```

---

# Final Checklist

Before considering the project complete, verify that you can:

- ✅ Build all three Node.js microservices
- ✅ Build and push Docker images
- ✅ Deploy to Kubernetes
- ✅ Access services through NGINX Ingress
- ✅ Connect to MongoDB Atlas
- ✅ Use ConfigMaps and Secrets
- ✅ Authenticate with JWT
- ✅ Configure readiness and liveness probes
- ✅ Scale manually and with HPA
- ✅ Perform rolling updates and rollbacks
- ✅ View logs using `kubectl logs`
- ✅ Monitor the cluster with Prometheus and Grafana
- ✅ Package the application using Helm
- ✅ Automate deployments with GitHub Actions

---

# Congratulations! 🎉

You have completed an **end-to-end production-ready Node.js Microservices project** covering the core technologies used in modern cloud-native application development.

Along the way, you also solved real-world implementation challenges, including:

- ✅ ErrImageNeverPull
- ✅ Docker Hub authentication and image tagging
- ✅ NGINX Ingress access on Docker Desktop
- ✅ MongoDB Atlas connection using Kubernetes Secrets
- ✅ HPA command deprecation (`--cpu-percent → --cpu=70%`)
- ✅ Helm template errors (`nil pointer evaluating interface {}.port`)
- ✅ Pod naming issues when retrieving logs
- ✅ Rolling updates and image versioning
- ✅ Metrics Server TLS certificate issues
- ✅ Prometheus & Grafana installation and access

This project demonstrates not only the final architecture but also the troubleshooting, deployment, monitoring, and operational skills required to build and maintain production-ready microservices on Kubernetes.