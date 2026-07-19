Build a Production Jenkins for CI/CD
Goal

Create a Jenkins container that already contains:

✅ Jenkins
✅ Git
✅ Node.js
✅ npm
✅ Docker CLI
✅ Helm
✅ kubectl
✅ Required Jenkins Plugins

Then use it to deploy your microservices automatically.

Step 1 – Create a New Folder

Create a separate folder outside your microservices project.

DevOps-Jenkins/
│
├── Dockerfile
├── docker-compose.yml
├── plugins.txt
└── README.md
Step 2 – Create Dockerfile

Create Dockerfile

FROM jenkins/jenkins:lts

USER root

##############################################
# Install Linux Packages
##############################################

RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    ca-certificates \
    gnupg \
    lsb-release

##############################################
# Install NodeJS 22
##############################################

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash -

RUN apt-get install -y nodejs

##############################################
# Install Docker CLI
##############################################

RUN apt-get install -y docker.io

##############################################
# Install kubectl
##############################################

RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

RUN install -m 0755 kubectl /usr/local/bin/kubectl

RUN rm kubectl

##############################################
# Install Helm
##############################################

RUN curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

##############################################
# Jenkins Plugins
##############################################

COPY plugins.txt /usr/share/jenkins/ref/plugins.txt

RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

USER jenkins
Step 3 – plugins.txt
git
pipeline-stage-view
workflow-aggregator
docker-workflow
docker-plugin
credentials-binding
github
blueocean
kubernetes-cli
Step 4 – docker-compose.yml
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
Step 5 – Build Jenkins Image

Open PowerShell.

cd DevOps-Jenkins

Build:

docker compose build

Expected:

Successfully built
Successfully tagged devops-jenkins
Step 6 – Start Jenkins
docker compose up -d


docker compose up -d
[+] up 3/4
 ✔ Network... Created                                                                                               0.1s
 ✔ Volume ... Created                                                                                               0.0s
 - Contain... Creating                                                                                              0.1s
 ✘ service... Error response from daemon: Conflict. The container name "/jenkins" is already in use by container "0a72ebefa8d5f84a67d5daf341a8a4c8a0ce7eedfeaa98b1da872b53a868ee56". You have to remove (or rename) that container to be able to reuse that name. 0.0s
Error response from daemon: Conflict. The container name "/jenkins" is already in use by container "0a72ebefa8d5f84a67d5daf341a8a4c8a0ce7eedfeaa98b1da872b53a868ee56". You have to remove (or rename) that container to be able to reuse that name.

What's next:
    Debug this Compose error with Gordon → docker ai "help me fix this compose error"

Excellent! This is a normal Docker conflict. You already have a container named jenkins running.

The error:

Conflict. The container name "/jenkins" is already in use

means Docker Compose is trying to create another container with the same name.

Option 1 (Recommended) - Stop and Remove the Old Jenkins

First, check your containers:

docker ps -a

You'll likely see something like:

CONTAINER ID   IMAGE                  NAME
0a72ebefa8d5   jenkins/jenkins:lts     jenkins

Stop it:

docker stop jenkins

Remove it:

docker rm jenkins

Now start your new custom Jenkins:

docker compose up -d
Option 2 - Keep Both Jenkins Containers

If you want to keep your existing Jenkins, edit your docker-compose.yml.

Change:

container_name: jenkins

to:

container_name: jenkins-devops

Also change the port:

ports:
  - "8081:8080"

instead of

8080:8080

Then run:

docker compose up -d

Open:

http://localhost:8081


Check:

docker ps

You should see:

jenkins
Step 7 – Open Jenkins
http://localhost:8080

Get password:

docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
Step 8 – Verify Installed Tools

Open terminal:

docker exec -it jenkins bash

Run:

node -v

npm -v

git --version

docker --version

kubectl version --client

helm version

Everything should work.

Step 9 – Install Suggested Plugins

Most plugins are already installed from plugins.txt.

Verify:

Manage Jenkins

↓

Plugins

You should see:

Git
Docker Pipeline
Pipeline
GitHub
Blue Ocean
Kubernetes CLI
Step 10 – Create Credentials

GitHub

github-creds

DockerHub

dockerhub-creds
Step 11 – Create Pipeline

New Item

↓

Pipeline

↓

Pipeline from SCM

Repository

https://github.com/firdousalam2058/Microservice-Docker-Kubernetes.git

Credentials

↓

GitHub PAT

Branch

main

Script Path

Jenkinsfile
Step 12 – Jenkinsfile

Stages

Checkout

↓

Install

↓

Test

↓

Build Docker

↓

Docker Login

↓

Push Docker

↓

Helm Upgrade

↓

Verify
Step 13 – Pipeline Execution
GitHub
    │
    ▼
Checkout
    │
    ▼
npm install
    │
    ▼
npm test
    │
    ▼
docker build
    │
    ▼
docker login
    │
    ▼
docker push
    │
    ▼
helm upgrade
    │
    ▼
kubectl get pods
Step 14 – GitHub Webhook

Repository

↓

Settings

↓

Webhooks

↓

Payload URL

http://YOUR-IP:8080/github-webhook/

Select:

Push Event

Now every push automatically starts Jenkins.

Final Architecture
                GitHub
                   │
                   ▼
         Jenkins (Custom Image)
     ┌───────────────────────────┐
     │ Jenkins                   │
     │ Git                       │
     │ Node.js                   │
     │ npm                       │
     │ Docker CLI                │
     │ Helm                      │
     │ kubectl                   │
     └───────────────────────────┘
                   │
                   ▼
          Docker Desktop Engine
                   │
                   ▼
             Docker Hub
                   │
                   ▼
        Kubernetes Cluster (Kind)
                   │
                   ▼
          Helm Rolling Upgrade
                   │
                   ▼
          Running Microservices
One improvement for Windows + Docker Desktop

Because you're using Windows with Docker Desktop, I would make one enhancement to the Docker Compose setup:

Mount the Docker socket (or named pipe, depending on your Docker Desktop configuration) so the Jenkins container can access the Docker daemon.
Persist jenkins_home so jobs, plugins, and credentials survive container recreation.
Add environment variables and user/group configuration as needed to avoid Docker permission issues.

That will make your Jenkins setup more reliable on Windows and is the version I'd recommend for the rest of your CI/CD series.