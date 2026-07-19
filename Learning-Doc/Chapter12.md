# Chapter 12 – Packaging the Application with Helm & Automating Deployments Using Jenkins & GitHub Actions CI/CD

# Building Production-Ready Node.js Microservices using Docker, Kubernetes, Helm & CI/CD

---

# Chapter Overview

Congratulations! 🎉

By this stage, you have successfully built a complete production-ready Node.js Microservices application.

Your project now includes:

* ✅ Three Node.js Microservices
* ✅ Docker
* ✅ Docker Hub
* ✅ Kubernetes Deployments
* ✅ Kubernetes Services
* ✅ NGINX Ingress
* ✅ MongoDB Atlas
* ✅ Kubernetes Secrets & ConfigMaps
* ✅ JWT Authentication
* ✅ Health Checks
* ✅ Horizontal Pod Autoscaler (HPA)
* ✅ Rolling Updates
* ✅ Prometheus & Grafana Monitoring

At this point, your application is production-ready.

However, imagine maintaining **20, 50, or even 100 microservices**.

Managing individual Kubernetes YAML files quickly becomes difficult.

Instead of running:

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

Production teams use:

* **Helm** to package Kubernetes resources.
* **Jenkins** for Local Continuous Integration and Continuous Deployment.
* **GitHub Actions** for Cloud-based CI/CD.

By the end of this chapter, you will be able to:

* Package the complete application using Helm.
* Deploy the entire application using a single command.
* Automatically build Docker images after every code change.
* Automatically push images to Docker Hub.
* Automatically deploy updates to Kubernetes using Jenkins.
* Deploy the same application from GitHub Actions.

---

# Final Project Structure

```text
Microservice-Docker-Kubernetes/

├── auth-service/
├── user-service/
├── product-service/

├── k8s/

├── helm/
│   └── microservices/
│       ├── Chart.yaml
│       ├── values.yaml
│       ├── values-dev.yaml
│       ├── values-prod.yaml
│       ├── .helmignore
│       ├── charts/
│       └── templates/
│            ├── auth-deployment.yaml
│            ├── auth-service.yaml
│            ├── user-deployment.yaml
│            ├── user-service.yaml
│            ├── product-deployment.yaml
│            ├── product-service.yaml
│            ├── ingress.yaml
│            ├── secret.yaml
│            ├── configmap.yaml
│            └── _helpers.tpl

├── Jenkinsfile

└── .github/
    └── workflows/
         └── deploy.yml
```

---

# Part 1 – Packaging Kubernetes Resources Using Helm

## Why Helm?

Helm is the package manager for Kubernetes.

Instead of maintaining dozens of Kubernetes YAML files, Helm packages everything into a reusable **Chart**.

## Benefits

* Reusable deployments
* Environment-specific configurations
* Easy upgrades
* Easy rollbacks
* Parameterized values
* Version-controlled deployments
* One-command installation
* Simplified maintenance

---

# Step 1 – Install Helm

Verify Helm installation:

```bash
helm version
```

Example output:

```text
version.BuildInfo{
Version:"v4.x.x"
}
```

If Helm is not installed:

### Windows

```powershell
winget install Helm.Helm
```

Verify again:

```bash
helm version
```

---

# Step 2 – Create a Helm Chart

```bash
mkdir helm

cd helm

helm create microservices
```

Generated structure:

```text
microservices/
├── Chart.yaml
├── values.yaml
└── templates/
```

---

# Step 3 – Understanding Chart.yaml

Every Helm chart contains a **Chart.yaml** file.

Example:

```yaml
apiVersion: v2
name: microservices
description: Production Node.js Microservices
type: application
version: 0.1.0
appVersion: "1.0"
```

## Explanation

| Property    | Description            |
| ----------- | ---------------------- |
| apiVersion  | Helm Chart API Version |
| name        | Chart Name             |
| description | Project Description    |
| type        | Application or Library |
| version     | Chart Version          |
| appVersion  | Application Version    |

---

# Step 4 – Configure values.yaml

Instead of hardcoding image names and replica counts inside YAML files, move everything into **values.yaml**.

Example:

```yaml
auth:

  replicaCount: 2

  image:
    repository: firdousalam2058/auth-service
    tag: v1
    pullPolicy: Always

  service:
    type: ClusterIP
    port: 3000

user:

  replicaCount: 2

  image:
    repository: firdousalam2058/user-service
    tag: v1

product:

  replicaCount: 2

  image:
    repository: firdousalam2058/product-service
    tag: v1
```

## Benefits

* No hardcoded values
* Environment-specific configuration
* Easier upgrades
* Better maintenance

---

# Step 5 – Create Environment-specific Values Files

Development

```text
values-dev.yaml
```

Production

```text
values-prod.yaml
```

Deploy Development:

```bash
helm install microservice-app ./helm/microservices -f values-dev.yaml
```

Deploy Production:

```bash
helm upgrade microservice-app ./helm/microservices -f values-prod.yaml
```

---

# Step 6 – Convert Kubernetes YAML Files into Helm Templates

Copy existing Kubernetes manifests.

```text
k8s/
└── auth-deployment.yaml

↓

helm/microservices/templates/
└── auth-deployment.yaml
```

Repeat for:

* auth-service
* user-deployment
* user-service
* product-deployment
* product-service
* ingress
* secret
* configmap

---

# Step 7 – Replace Hardcoded Values

Before:

```yaml
replicas: 1

image: firdousalam2058/auth-service:v7
```

After:

```yaml
replicas: {{ .Values.auth.replicaCount }}

image: "{{ .Values.auth.image.repository }}:{{ .Values.auth.image.tag }}"
```

---

# Step 8 – Helm Variables

Frequently used Helm objects:

```text
.Values

.Chart

.Release

.Capabilities
```

Examples:

```yaml
{{ .Release.Name }}

{{ .Chart.Name }}

{{ .Release.Namespace }}

{{ .Values.auth.image.tag }}
```

---

# Step 9 – Helper Templates

Create:

```text
templates/_helpers.tpl
```

Example:

```yaml
{{- define "microservice.labels" }}

app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/version: {{ .Chart.Version }}

{{- end }}
```

Use:

```yaml
labels:

{{ include "microservice.labels" . | indent 4 }}
```

Benefits:

* Avoid duplicated YAML
* Standard labels
* Easier maintenance

---

# Step 10 – Validate the Helm Chart

Lint the chart:

```bash
helm lint ./helm/microservices
```

Render templates:

```bash
helm template microservice-app ./helm/microservices
```

---

# Step 11 – Install the Helm Chart

```bash
helm install microservice-app ./helm/microservices
```

Verify:

```bash
helm list
```

---

# Step 12 – Upgrade the Release

Whenever you update:

* Images
* Replica count
* ConfigMaps
* Secrets

Run:

```bash
helm upgrade microservice-app ./helm/microservices
```

---

# Step 13 – Rollback

View history:

```bash
helm history microservice-app
```

Rollback:

```bash
helm rollback microservice-app 2
```

---

# Step 14 – Uninstall

```bash
helm uninstall microservice-app
```

---

# Part 2 – Local Jenkins CI/CD Pipeline

## Why Jenkins?

During development, we continuously make changes to our source code.

Without CI/CD:

```text
Modify Code

↓

docker build

↓

docker push

↓

helm upgrade

↓

kubectl rollout
```

Repeating these steps manually becomes time-consuming.

Jenkins automates the complete deployment process.

---

# Jenkins CI/CD Workflow

```text
Developer

        │

Git Commit / Push

        │

        ▼

Jenkins Pipeline

        │

Checkout Source

        │

Install Dependencies

        │

Run Tests

        │

Build Docker Images

        │

Push Images to Docker Hub

        │

Helm Upgrade

        │

Verify Rollout

        │

        ▼

Docker Desktop Kubernetes
```

---

# Step 15 – Install Jenkins

Run Jenkins using Docker:

```bash
docker run -d \
--name jenkins \
-p 8080:8080 \
-p 50000:50000 \
-v jenkins_home:/var/jenkins_home \
jenkins/jenkins:lts
```

Open:

```text
http://localhost:8080
```

---

# Step 16 – Install Jenkins Plugins

Install:

* Git
* Docker Pipeline
* Docker
* Pipeline
* Kubernetes CLI
* Blue Ocean (Optional)

---

# Step 17 – Configure Docker & Kubernetes

Verify Docker:

```bash
docker version
```

Verify Kubernetes:

```bash
kubectl get nodes
```

If Jenkins can execute both commands, it is ready to deploy.

---

# Step 18 – Create Jenkins Pipeline

Create a **Pipeline Project** instead of a Freestyle Job.

Pipeline stages:

```text
Checkout

↓

Install Dependencies

↓

Run Tests

↓

Build Docker Images

↓

Push Docker Images

↓

Helm Upgrade

↓

Verify Deployment
```

---

# Step 19 – Jenkinsfile

Create a **Jenkinsfile** in the project root.

Pipeline stages:

```groovy
stage('Checkout')

stage('Install')

stage('Test')

stage('Build Docker')

stage('Push Docker')

stage('Deploy Using Helm')

stage('Verify')
```

Each stage should execute only after the previous stage completes successfully.

---

# Step 20 – Deploy Using Helm

Instead of running multiple `kubectl apply` commands, deploy using Helm.

```bash
helm upgrade --install microservice-app \
./helm/microservices \
--set auth.image.tag=${BUILD_NUMBER} \
--set user.image.tag=${BUILD_NUMBER} \
--set product.image.tag=${BUILD_NUMBER}
```

This automatically deploys the latest Docker images using the Jenkins build number as the image tag.

---

# Step 21 – Verify Deployment

Verify rollout:

```bash
kubectl rollout status deployment/auth-deployment

kubectl rollout status deployment/user-deployment

kubectl rollout status deployment/product-deployment
```

Verify Pods:

```bash
kubectl get pods
```

---

# Part 3 – GitHub Actions CI/CD

GitHub Actions automates the same deployment process in the cloud.

Workflow:

```text
Developer

↓

Git Push

↓

GitHub Actions

↓

Build

↓

Test

↓

Docker Build

↓

Docker Push

↓

Helm Upgrade

↓

Kubernetes Cluster
```

Store the following secrets in GitHub:

* DOCKER_USERNAME
* DOCKER_PASSWORD
* KUBE_CONFIG

Deploy using:

```bash
helm upgrade --install microservice-app ./helm/microservices
```

---

# Local Jenkins vs GitHub Actions

| Feature                   | Jenkins | GitHub Actions |
| ------------------------- | ------- | -------------- |
| Local Development         | ✅       | ❌              |
| Works Offline             | ✅       | ❌              |
| Docker Desktop Kubernetes | ✅       | ⚠️             |
| Easy for Beginners        | ✅       | ✅              |
| Cloud CI/CD               | ❌       | ✅              |
| Enterprise Usage          | ✅       | ✅              |

---

# Helm Commands

```bash
helm version

helm lint ./helm/microservices

helm template microservice-app ./helm/microservices

helm install microservice-app ./helm/microservices

helm upgrade microservice-app ./helm/microservices

helm upgrade --install microservice-app ./helm/microservices

helm history microservice-app

helm rollback microservice-app 2

helm uninstall microservice-app
```

---

# Common Issues

## Helm Template Error

```
nil pointer evaluating interface {}.port
```

### Cause

Default Helm test templates referenced:

```yaml
.Values.service.port
```

while our project uses:

```yaml
auth

user

product
```

### Solution

Remove:

```text
templates/tests/
```

or update the template to match your values structure.

---

## Helm Upgrade Doesn't Update Pods

### Cause

Image tag remains unchanged.

### Solution

Use a new image tag (e.g., `v8`) or configure:

```yaml
imagePullPolicy: Always
```

during development.

---

# Best Practices

* Keep all configurable values in `values.yaml`.
* Use separate values files for Development, Staging, and Production.
* Use helper templates to avoid duplication.
* Validate charts using `helm lint`.
* Test rendered manifests using `helm template`.
* Use `helm upgrade --install` in every deployment pipeline.
* Tag Docker images with version numbers instead of `latest`.
* Automate deployments using Jenkins or GitHub Actions.

---

# Final Architecture

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
          ┌─────────────┴─────────────┐
          ▼                           ▼
     Jenkins CI/CD           GitHub Actions
          │                           │
          └─────────────┬─────────────┘
                        ▼
             Automated Deployments
```

---

# Final Checklist

* ✅ Package Kubernetes resources using Helm.
* ✅ Deploy the application using a single Helm command.
* ✅ Create reusable Helm templates.
* ✅ Manage Development and Production values.
* ✅ Install Jenkins locally.
* ✅ Configure Docker and Kubernetes in Jenkins.
* ✅ Create a Jenkins Pipeline.
* ✅ Automate Docker image builds.
* ✅ Push Docker images to Docker Hub.
* ✅ Deploy automatically using Helm.
* ✅ Verify Kubernetes rollouts.
* ✅ Automate deployments using GitHub Actions.
* ✅ Troubleshoot Helm and CI/CD issues.

---

## Congratulations! 🎉

You have now completed an end-to-end production-grade Node.js Microservices project covering:

* Docker
* Kubernetes
* Helm
* Jenkins CI/CD
* GitHub Actions CI/CD
* Monitoring with Prometheus & Grafana
* Horizontal Pod Autoscaling
* Rolling Updates
* Secure Configuration using ConfigMaps & Secrets
* JWT Authentication
* Production Deployment Best Practices

You now have the knowledge and hands-on experience to build, package, automate, deploy, monitor, and maintain production-ready cloud-native microservices using modern DevOps practices.
