# Jenkins Deployment Fix Documentation

## Jenkins + Docker + Kubernetes + Helm CI/CD Troubleshooting Guide

## Overview

This document explains the issues encountered while setting up a Jenkins CI/CD pipeline for deploying Node.js microservices to Kubernetes using Docker and Helm.

The deployment flow:

```
Developer
    |
    | Git Push
    ↓
GitHub Repository
    |
    ↓
Jenkins Pipeline
    |
    ├── Checkout Source Code
    |
    ├── Install Node Dependencies
    |
    ├── Build Docker Images
    |
    ├── Push Images to Docker Hub
    |
    ├── Deploy Using Helm
    |
    └── Verify Kubernetes Deployment
```

---

# Environment Details

## Application

Three Node.js Microservices:

```
auth-service
user-service
product-service
```

## Infrastructure

| Component  | Version               |
| ---------- | --------------------- |
| Kubernetes | v1.36.1               |
| kubectl    | v1.36.1               |
| Helm       | v3.x                  |
| Docker     | Docker Desktop        |
| Jenkins    | Jenkins LTS Container |
| Node.js    | v22.x                 |

---

# Issue 1: npm Command Not Found

## Error

Pipeline failed during Install stage:

```
npm: not found
```

## Root Cause

Jenkins container did not have Node.js and npm installed.

Pipeline was running:

```groovy
agent any
```

which means commands execute inside Jenkins container.

---

## Fix

Installed Node.js inside Jenkins container:

```bash
docker exec -it -u root jenkins bash
```

Install Node.js:

```bash
apt update

curl -fsSL https://deb.nodesource.com/setup_22.x | bash -

apt install -y nodejs
```

Verification:

```bash
node -v
npm -v
```

Result:

```
Node.js installed successfully
npm install stage passed
```

---

# Issue 2: Docker Permission Denied

## Error

Docker build failed:

```
permission denied while trying to connect to the Docker daemon socket

unix:///var/run/docker.sock
```

---

## Root Cause

Jenkins container had access to Docker socket:

```
/var/run/docker.sock
```

but Jenkins user did not have permission.

---

## Investigation

Checked Jenkins user:

```bash
id
```

Initial output:

```
uid=1000(jenkins)
groups=1000(jenkins)
```

Docker group was missing.

---

## Added Jenkins User to Docker Group

Added:

```bash
usermod -aG docker jenkins
```

Verified:

```bash
id
```

Result:

```
uid=1000(jenkins)
groups=1000(jenkins),102(docker)
```

---

## Remaining Issue

Docker socket ownership was incorrect.

Checked:

```bash
ls -l /var/run/docker.sock
```

Output:

```
srw-rw---- 1 root root docker.sock
```

Socket belonged to root group instead of docker group.

---

## Final Fix

Changed socket ownership:

```bash
chown root:docker /var/run/docker.sock
```

Verification:

```bash
ls -l /var/run/docker.sock
```

Result:

```
srw-rw---- 1 root docker /var/run/docker.sock
```

---

## Validation

Logged in as Jenkins user:

```bash
docker exec -it jenkins bash
```

Test:

```bash
docker ps
```

Docker access successful.

---

# Issue 3: Docker Build Successful

After Docker permission fix:

Pipeline successfully executed:

```bash
docker build -t firdousalam2058/auth-service:v1 ./auth-service

docker build -t firdousalam2058/user-service:v1 ./user-service

docker build -t firdousalam2058/product-service:v1 ./product-service
```

Result:

```
Successfully tagged images
```

---

# Issue 4: Docker Hub Credential Missing

## Error

Pipeline failed during Push stage:

```
ERROR: Could not find credentials entry with ID 'dockerhub'
```

---

## Root Cause

Jenkinsfile expected:

```groovy
credentialsId: 'dockerhub'
```

but Jenkins credential was not created.

---

## Fix

Created Jenkins credential:

Location:

```
Manage Jenkins
    |
Credentials
    |
Global Credentials
    |
Add Credentials
```

Configuration:

```
Kind:
Username with password

Username:
firdousalam2058

Password:
Docker Hub Access Token

ID:
dockerhub
```

---

## Result

Docker push succeeded:

```bash
docker push firdousalam2058/auth-service:v1

docker push firdousalam2058/user-service:v1

docker push firdousalam2058/product-service:v1
```

Output:

```
Login Succeeded

v1: digest pushed successfully
```

---

# Issue 5: Helm Command Not Found

## Error

Deployment stage failed:

```
helm: not found
```

---

## Root Cause

Helm was installed on host machine but not inside Jenkins container.

---

## Fix

Installed Helm inside Jenkins container:

```bash
docker exec -it -u root jenkins bash
```

Installation:

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

Verification:

```bash
helm version
```

Result:

```
Helm installed successfully
```

---

# Issue 6: Kubernetes Cluster Authentication Failure

## Error

Helm deployment failed:

```
Error: Kubernetes cluster unreachable
```

Response:

```
Authentication required

You are authenticated as: anonymous
```

---

## Root Cause

Jenkins pipeline runs as:

```
jenkins user
```

but Kubernetes configuration existed only for:

```
root user
```

Existing kubeconfig:

```
/root/.kube/config
```

Jenkins could not access it.

---

## Investigation

As Jenkins user:

```bash
cat /root/.kube/config
```

Result:

```
Permission denied
```

---

# Kubernetes Configuration Fix

## Copy kubeconfig for Jenkins user

Enter root container:

```bash
docker exec -it -u root jenkins bash
```

Create directory:

```bash
mkdir -p /var/jenkins_home/.kube
```

Copy configuration:

```bash
cp /root/.kube/config /var/jenkins_home/.kube/config
```

Change ownership:

```bash
chown -R jenkins:jenkins /var/jenkins_home/.kube
```

---

## Configure Jenkins Pipeline

Added:

```groovy
pipeline {

    agent any

    environment {
        KUBECONFIG="/var/jenkins_home/.kube/config"
    }

}
```

---

# Final Jenkins Pipeline Flow

After all fixes:

```
GitHub
   |
   ↓
Jenkins
   |
   |
   ├── Checkout Code                 ✅
   |
   ├── npm install                   ✅
   |
   ├── Docker Build                  ✅
   |
   ├── Docker Push                   ✅
   |
   ├── Helm Deployment               ✅
   |
   └── Kubernetes Verification       ✅
```

---

# Lessons Learned

## 1. Jenkins Container Isolated Environment

Installing tools on the host machine does not automatically make them available inside Jenkins.

Required tools:

```
node
npm
docker
kubectl
helm
```

must exist inside Jenkins environment.

---

## 2. Docker Socket Permission

For Docker-in-Docker style CI:

Jenkins requires:

```
/var/run/docker.sock
```

and permission:

```
jenkins user → docker group → docker socket
```

---

## 3. Kubernetes Authentication

kubectl and Helm require kubeconfig:

```
~/.kube/config
```

The user running Jenkins jobs must have access.

---

# Final Production Improvements

Future improvements:

1. Use Jenkins Kubernetes Agent instead of static container.

2. Store Kubernetes credentials using Jenkins Credentials Store.

3. Use image versioning:

Example:

```
auth-service:${BUILD_NUMBER}
```

instead of:

```
auth-service:v1
```

4. Add automated rollback:

```bash
helm rollback
```

5. Add application testing stage.

---

# Final Status

Jenkins CI/CD deployment for Node.js Microservices using:

* GitHub
* Jenkins
* Docker
* Docker Hub
* Kubernetes
* Helm

is successfully configured.
