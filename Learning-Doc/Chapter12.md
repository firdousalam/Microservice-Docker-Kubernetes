Chapter 12 – Packaging the Application with Helm & Automating Deployments Using GitHub Actions CI/CD
Building Production-Ready Node.js Microservices using Docker, Kubernetes, Helm & CI/CD
Chapter Overview

Congratulations! By now, you've built a complete production-style microservices application.

Your project includes:

✅ Three Node.js Microservices
✅ Docker
✅ Docker Hub
✅ Kubernetes Deployments
✅ Kubernetes Services
✅ NGINX Ingress
✅ MongoDB Atlas
✅ Secrets & ConfigMaps
✅ JWT Authentication
✅ Health Checks
✅ Horizontal Pod Autoscaler (HPA)
✅ Rolling Updates
✅ Prometheus & Grafana Monitoring

Your application is now production-ready.

However, imagine you have 20 microservices instead of 3.

Every deployment would require manually running:

kubectl apply -f auth-deployment.yaml
kubectl apply -f auth-service.yaml

kubectl apply -f user-deployment.yaml
kubectl apply -f user-service.yaml

kubectl apply -f product-deployment.yaml
kubectl apply -f product-service.yaml

kubectl apply -f ingress.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml

This quickly becomes difficult to manage.

Production teams solve this by using:

Helm for packaging Kubernetes resources.
GitHub Actions for automating builds and deployments.

By the end of this chapter, you'll have a single command to deploy your application and an automated CI/CD pipeline that builds, pushes, and deploys changes whenever you push code to GitHub.

Why Helm?

Helm is the package manager for Kubernetes.

Instead of maintaining many YAML files, Helm bundles them into a reusable Chart.

Benefits:

Reusable deployments
Environment-specific configurations
Easy upgrades
Easy rollbacks
Parameterized values
Version control
Project Structure

After creating the Helm chart, your project should look like this:

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
Step 1 – Install Helm

Verify Helm:

helm version

Example:

version.BuildInfo{
Version:"v3.18.0"
}

If Helm isn't installed:

Windows

winget install Helm.Helm

Verify again:

helm version
Step 2 – Create a Helm Chart

Run:

mkdir helm

cd helm

helm create microservices

Helm generates:

microservices/
    Chart.yaml
    values.yaml
    templates/
Step 3 – Remove Default Templates

During our implementation, Helm generated unnecessary files such as:

templates/

NOTES.txt

serviceaccount.yaml

hpa.yaml

ingress.yaml

_helpers.tpl

tests/

For this project, we removed the files we didn't need.

Delete:

templates/

NOTES.txt

serviceaccount.yaml

hpa.yaml

_helpers.tpl

tests/

This resolves errors such as:

INSTALLATION FAILED

microservices/templates/tests/test-connection.yaml

nil pointer evaluating interface {}.port

Real issue we encountered: Helm failed because the generated test-connection.yaml referenced .Values.service.port, but our values.yaml defined separate auth, user, and product sections. Removing the unused tests/ folder fixed the problem.

Step 4 – Create values.yaml

Instead of hardcoding image names, ports, and replica counts, store them in values.yaml.

Example:

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

You can later override these values for development, staging, or production.

Step 5 – Convert Kubernetes YAML Files into Helm Templates

Copy your existing Kubernetes manifests from the k8s/ folder into the Helm templates/ folder.

Example:

k8s/
    auth-deployment.yaml

↓

helm/microservices/templates/
    auth-deployment.yaml

Repeat this for:

auth-service.yaml
user-deployment.yaml
user-service.yaml
product-deployment.yaml
product-service.yaml
ingress.yaml
secret.yaml
configmap.yaml
Step 6 – Replace Hardcoded Values

One of the questions you asked during implementation was:

"Where should I replace {{ .Values.auth.image }}?"

You replace only the configurable values inside the copied YAML files.

Example:

Before

spec:
  replicas: 1

containers:

- name: auth

  image: firdousalam2058/auth-service:v7

After

spec:
  replicas: {{ .Values.auth.replicas }}

containers:

- name: auth

  image: {{ .Values.auth.image }}

Similarly, update the Service:

ports:
- port: {{ .Values.auth.port }}

  targetPort: {{ .Values.auth.port }}

Repeat this process for the User and Product services.

Step 7 – Validate the Helm Chart

Before installing, validate the generated manifests.

helm lint ./helm/microservices

Render the templates locally:

helm template microservice-app ./helm/microservices

Review the output to ensure the template expressions are replaced with the correct values.

Step 8 – Install the Helm Chart

Deploy the application:

helm install microservice-app ./helm/microservices

Verify:

helm list

Expected:

NAME

microservice-app
Step 9 – Upgrade the Release

Whenever you change:

image
replicas
ports
ConfigMaps
Secrets

Run:

helm upgrade microservice-app ./helm/microservices

Helm updates only the changed resources.

Step 10 – Uninstall the Application

To remove everything managed by Helm:

helm uninstall microservice-app

This deletes the Deployments, Services, Ingress, ConfigMaps, and Secrets created by the chart.

GitHub Actions CI/CD

CI/CD stands for:

Continuous Integration (CI) – Build and test every code change.
Continuous Deployment (CD) – Automatically deploy successful builds.

Instead of manually rebuilding images and updating Kubernetes, GitHub Actions performs these tasks for you.

CI/CD Workflow
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
Step 11 – Create the Workflow Directory
.github/

    workflows/

        deploy.yml
Step 12 – Configure GitHub Secrets

Store sensitive values securely in your GitHub repository:

Secret	Purpose
DOCKER_USERNAME	Docker Hub username
DOCKER_PASSWORD	Docker Hub password or access token
KUBE_CONFIG	Base64-encoded kubeconfig for cluster access

Do not hardcode credentials in your workflow.

Step 13 – Create deploy.yml

A typical workflow includes:

Trigger on push to main.
Check out the repository.
Set up Node.js.
Install dependencies.
Run tests.
Build Docker images.
Log in to Docker Hub.
Push Docker images.
Configure kubectl.
Update Kubernetes Deployments.
Wait for rollout completion.

A simplified example:

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

      - name: Push Images
        run: |
          docker push ${{ secrets.DOCKER_USERNAME }}/auth-service:latest
          docker push ${{ secrets.DOCKER_USERNAME }}/user-service:latest
          docker push ${{ secrets.DOCKER_USERNAME }}/product-service:latest

You can extend this workflow by installing kubectl, loading the kubeconfig, and running kubectl set image or helm upgrade.

Step 14 – Deploy Using Helm in CI/CD

Instead of multiple kubectl apply commands, use Helm:

helm upgrade --install microservice-app ./helm/microservices

This single command:

Installs the application if it doesn't exist.
Upgrades it if it already exists.
Step 15 – Verify the Deployment

Check the rollout:

kubectl rollout status deployment auth-deployment

View Pods:

kubectl get pods

Confirm the new image version is running:

kubectl describe pod <pod-name>
Useful Commands

Verify Helm:

helm version

Validate chart:

helm lint ./helm/microservices

Render templates:

helm template microservice-app ./helm/microservices

Install:

helm install microservice-app ./helm/microservices

Upgrade:

helm upgrade microservice-app ./helm/microservices

Upgrade or install:

helm upgrade --install microservice-app ./helm/microservices

List releases:

helm list

View release values:

helm get values microservice-app

Uninstall:

helm uninstall microservice-app
Common Issues We Encountered
1. nil pointer evaluating interface {}.port

Cause

The default Helm test template referenced .Values.service.port, but our values.yaml used separate sections.

Solution

Remove the templates/tests/ directory or update the test template to match your values.

2. Chart.yaml or values.yaml Missing

Cause

The chart wasn't created properly.

Solution

Recreate it:

helm create microservices

Then copy your templates again.

3. Hardcoded Values Still Present

Cause

Some manifests still contained fixed image names or replica counts.

Solution

Replace configurable values with Helm expressions, for example:

replicas: {{ .Values.auth.replicas }}
image: {{ .Values.auth.image }}
4. Helm Upgrade Doesn't Change Pods

Cause

The image tag didn't change, so Kubernetes didn't detect a new version.

Solution

Use a new image tag (e.g., v8) or configure imagePullPolicy: Always during development.

Best Practices
Keep all configurable values in values.yaml.
Use separate values files for development, staging, and production.
Store secrets in GitHub Secrets, not in the repository.
Validate charts with helm lint before deployment.
Use helm upgrade --install in CI/CD pipelines.
Tag Docker images with version numbers instead of always using latest.
Test Helm templates with helm template before applying changes to a cluster.
Final Project Architecture
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
      Secrets      ConfigMaps      HPA
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
Final Checklist

Before considering the project complete, verify that you can:

✅ Build all three Node.js microservices.
✅ Build and push Docker images.
✅ Deploy to Kubernetes.
✅ Access services through NGINX Ingress.
✅ Connect to MongoDB Atlas.
✅ Use ConfigMaps and Secrets.
✅ Authenticate with JWT.
✅ Configure readiness and liveness probes.
✅ Scale manually and with HPA.
✅ Perform rolling updates and rollbacks.
✅ View logs with kubectl logs.
✅ Monitor the cluster with Prometheus and Grafana.
✅ Package the application with Helm.
✅ Automate deployments using GitHub Actions.
Congratulations!

You have completed an end-to-end microservices project covering the core technologies used in modern cloud-native application development. Along the way, you also solved real implementation issues such as:

ErrImageNeverPull
Docker Hub authentication and image tagging
Ingress access on Docker Desktop
MongoDB Atlas connection using Kubernetes Secrets
HPA command deprecation (--cpu-percent → --cpu=70%)
Helm template errors (nil pointer evaluating interface {}.port)
Pod naming issues when retrieving logs
Rolling updates and image versioning

This project forms a strong portfolio piece because it demonstrates not only the final architecture but also the troubleshooting and operational skills required to build and maintain production-ready microservices.