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

docker run -d --name jenkins -p 8080:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts
Open:

```text
http://localhost:8080
```

---


On Windows, the Jenkins initial admin password depends on how Jenkins was installed.

Method 1: If Jenkins was installed using the Windows Installer (.msi) (most common)

Open File Explorer and navigate to:

C:\ProgramData\Jenkins\.jenkins\secrets\initialAdminPassword

or sometimes:

C:\ProgramData\Jenkins\secrets\initialAdminPassword

Open the initialAdminPassword file with Notepad. The contents of the file are the password you'll use to unlock Jenkins.

Method 2: Using Command Prompt

Run:

type "C:\ProgramData\Jenkins\.jenkins\secrets\initialAdminPassword"

If that doesn't exist, try:

type "C:\ProgramData\Jenkins\secrets\initialAdminPassword"
Method 3: If Jenkins is running in Docker

Find your container:

docker ps

Then execute:

docker exec -it <container-name> cat /var/jenkins_home/secrets/initialAdminPassword

Example:

docker exec -it jenkins cat /var/jenkins_home/secrets/initialAdminPassword
Method 4: If you installed Jenkins manually using a WAR file

The password is usually located in:

C:\Users\<YourUsername>\.jenkins\secrets\initialAdminPassword
If the password file doesn't exist

This usually means one of the following:

Jenkins has already been configured.
The setup wizard has been completed.
You're looking in the wrong Jenkins home directory.

You can check the Jenkins Home directory by opening:

Manage Jenkins → System Information

or by checking the Jenkins logs.


# Step 16 – Install Jenkins Plugins

Install:

* Git
*cd 
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

Step 18 – Create Jenkins Pipeline
1. Create a New Pipeline Job
Jenkins Dashboard
Click New Item

Enter a name:

microservice-pipeline
Select Pipeline
Click OK

You are now on the page shown in your screenshot.

2. General Section

Fill these fields:

Description

CI/CD Pipeline for Node.js Microservices using Docker, Kubernetes, Helm and Jenkins

Leave the other options unchecked for now.

3. Triggers

For now, don't enable anything.

Later you can enable:

✅ GitHub hook trigger for GITScm polling

when you configure GitHub webhooks.

4. Pipeline Section

This is the important part.

Currently yours is:

Definition

Pipeline script

Change it to:

Pipeline script from SCM

You'll now see additional options.

SCM

Select

Git
Repository URL

Paste your GitHub repository.

Example

https://github.com/firdousalam2058/Microservice-Docker-Kubernetes.git
Credentials

If your repository is public, leave it empty.

If private, add GitHub credentials.

Branch
*/main

or

*/master

depending on your repository.

Script Path
Jenkinsfile

This tells Jenkins to read the Jenkinsfile from the project root.

Click Save.

Step 19 – Create Jenkinsfile

In your project root (same folder as helm, auth-service, user-service, etc.) create a file named:

Jenkinsfile

Example project structure:

Microservice-Docker-Kubernetes/
│
├── auth-service/
├── user-service/
├── product-service/
├── helm/
├── kubernetes/
├── Jenkinsfile
└── README.md
Basic Jenkinsfile

Start with this simple pipeline to verify Jenkins can execute the stages.

pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Install') {
            steps {
                echo 'Installing dependencies...'
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
            }
        }

        stage('Build Docker') {
            steps {
                echo 'Building Docker images...'
            }
        }

        stage('Push Docker') {
            steps {
                echo 'Pushing Docker images...'
            }
        }

        stage('Deploy Using Helm') {
            steps {
                echo 'Deploying using Helm...'
            }
        }

        stage('Verify') {
            steps {
                echo 'Verifying deployment...'
            }
        }
    }
}
How the Pipeline Works

When you click Build Now, Jenkins executes the stages in order:

Checkout
      │
      ▼
Install
      │
      ▼
Test
      │
      ▼
Build Docker
      │
      ▼
Push Docker
      │
      ▼
Deploy Using Helm
      │
      ▼
Verify

If any stage fails (for example, Docker build), Jenkins stops and the remaining stages are skipped. This ensures that later stages only run after earlier ones complete successfully.

Later, replace the placeholder commands

Once the pipeline structure is working, you can replace the echo statements with real commands, for example:

Install

npm install

Test

npm test

Build Docker

docker build -t firdousalam2058/auth-service:v1 ./auth-service

Push Docker

docker push firdousalam2058/auth-service:v1

Deploy Using Helm

helm upgrade --install microservice-app ./helm/microservices

Verify

kubectl get pods
kubectl get services

# Install Node

docker exec -u 0 -it jenkins bash

or equivalently:

docker exec --user root -it jenkins bash

Now your prompt should look like:

root@0a72ebefa8d5:/#

Then install Node.js:

apt-get update

apt-get install -y curl gnupg

curl -fsSL https://deb.nodesource.com/setup_22.x | bash -

apt-get install -y nodejs

Verify:

node -v
npm -v

you've moved past the npm issue. Now the pipeline is failing at the next dependency:

docker: not found

This means the Jenkins container does not have the Docker CLI installed (or it isn't on the PATH).

Step 1: Check if Docker CLI is installed

Inside the Jenkins container (as root), run:

docker --version

If you get:

bash: docker: command not found

then Docker CLI is not installed.

Step 2: Install the Docker CLI

If you're using a Debian/Ubuntu-based Jenkins image, run:

apt-get update
apt-get install -y docker.io

Verify:

docker --version
Step 3: Mount the Docker socket (Very Important)

Even if the Docker CLI is installed, docker build still won't work unless the Jenkins container can talk to the Docker daemon on the host.

When you start the Jenkins container, it should include:

-v /var/run/docker.sock:/var/run/docker.sock

or in Docker Compose:

volumes:
  - /var/run/docker.sock:/var/run/docker.sock

Without that mount, you'll typically see errors like:

Cannot connect to the Docker daemon at unix:///var/run/docker.sock
Step 4: How did you start Jenkins?

Please tell me which command you used.

For example, did you run something like:

docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts

or are you using a docker-compose.yml?

My recommendation

Since you're building a complete CI/CD project, repeatedly installing tools into a running container is fragile. A custom Jenkins image with:

Node.js
npm
Docker CLI
Helm
kubectl

preinstalled is much cleaner and reproducible.

Once you show me your docker run command or docker-compose.yml, I can help you update it so your Jenkins pipeline can successfully execute:

sh 'npm install'
sh 'docker build ...'
sh 'docker push ...'
sh 'helm upgrade ...'
sh 'kubectl get pods'

without needing to manually patch the container each time.

# Step 19.b – Create a Custom Jenkins Docker Image


Instead of using the default Jenkins image, we'll build one that already contains:

✅ Git
✅ Node.js & npm
✅ Docker CLI
✅ kubectl
✅ Helm
Project Structure

Create a new folder.

jenkins/
│
├── Dockerfile
└── docker-compose.yml
Dockerfile

Create a file named Dockerfile.

FROM jenkins/jenkins:lts

USER root

# Install required packages
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    unzip \
    git \
    ca-certificates \
    gnupg \
    lsb-release

#################################################
# Install NodeJS 22 + npm
#################################################

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash -

RUN apt-get install -y nodejs

#################################################
# Install Docker CLI
#################################################

RUN apt-get install -y docker.io

#################################################
# Install kubectl
#################################################

RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

RUN install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

#################################################
# Install Helm
#################################################

RUN curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

#################################################

USER jenkins
docker-compose.yml
version: "3.9"

services:

  jenkins:

    build: .

    container_name: jenkins

    restart: always

    ports:
      - "8080:8080"
      - "50000:50000"

    volumes:
      - jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock

volumes:

  jenkins_home:
Build Image
docker compose build
Start Jenkins
docker compose up -d
Verify Tools

Enter the container.

docker exec -it jenkins bash

Run:

node -v
npm -v
docker --version
kubectl version --client
helm version

Expected output:

Node v22.x

npm 10.x

Docker 29.x

kubectl 1.36.x

Helm v3.x
Update Jenkinsfile

Now your pipeline can actually execute commands.

Example:

pipeline {

    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                dir('auth-service') {
                    sh 'npm install'
                }

                dir('user-service') {
                    sh 'npm install'
                }

                dir('product-service') {
                    sh 'npm install'
                }
            }
        }

        stage('Build Docker') {
            steps {

                sh 'docker build -t firdousalam2058/auth-service:v1 ./auth-service'

                sh 'docker build -t firdousalam2058/user-service:v1 ./user-service'

                sh 'docker build -t firdousalam2058/product-service:v1 ./product-service'

            }
        }
    }
}
One More Thing: Docker Socket

Since Jenkins is running in a container and needs to build Docker images, the Docker socket must be mounted:

volumes:
  - /var/run/docker.sock:/var/run/docker.sock

Without this mount, docker build inside Jenkins won't be able to communicate with the Docker daemon.

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


