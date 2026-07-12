Chapter 1 – Introduction & Architecture
Building Production-Ready Node.js Microservices using Docker, Kubernetes, Helm & CI/CD

Author: Firdous Alam

Version: 1.0

1. Introduction

Modern applications are expected to be highly available, scalable, secure, and easy to maintain. Traditional monolithic applications often become difficult to manage as they grow larger because all features are tightly coupled into a single codebase.

Microservices solve this problem by breaking an application into multiple small, independent services. Each service focuses on a single business capability and communicates with other services over HTTP or messaging protocols.

In this project, we will build a production-style microservices application using:

Node.js
Express.js
Docker
Docker Hub
Kubernetes
NGINX Ingress
MongoDB Atlas
JWT Authentication
Helm
GitHub Actions CI/CD

By the end of this guide, you will have a complete working project that demonstrates how these technologies work together in a real-world environment.

2. What We Will Build

We will build an application consisting of three independent services.

Auth Service
        │
        │
        ▼
User Service
        │
        ▼
Product Service

Each service runs independently inside its own Docker container and Kubernetes Pod.

Every service can be deployed, updated, scaled, and restarted independently.

3. Project Objectives

The primary objectives of this project are:

Build independent Node.js microservices
Containerize each service using Docker
Store images in Docker Hub
Deploy services to Kubernetes
Enable communication using Kubernetes Services
Configure DNS-based service discovery
Route external traffic through NGINX Ingress
Connect services to MongoDB Atlas
Secure APIs using JWT Authentication
Configure Health Checks
Scale services using Kubernetes
Perform Rolling Updates
Package Kubernetes manifests using Helm
Automate deployments using GitHub Actions
4. Technologies Used
Technology	Purpose
Node.js	Backend runtime
Express.js	REST API Framework
Docker	Containerization
Docker Hub	Image Repository
Kubernetes	Container Orchestration
kubectl	Kubernetes CLI
NGINX Ingress	Reverse Proxy & Routing
MongoDB Atlas	Cloud Database
Mongoose	MongoDB ODM
JWT	Authentication
Helm	Kubernetes Package Manager
GitHub Actions	CI/CD Pipeline
Git	Version Control
5. Why Microservices?

Consider an e-commerce application.

It contains:

Login
Users
Products
Orders
Payments
Notifications

In a monolithic architecture, all of these modules run inside a single application.

Monolithic Application

+--------------------------------------+
| Login                                |
| Users                                |
| Products                             |
| Orders                               |
| Payments                             |
| Notifications                        |
+--------------------------------------+

If one module has a problem, it can affect the entire application.

Updating one feature often requires redeploying the whole application.

Scaling is inefficient because all components scale together, even if only one requires additional resources.

6. Microservices Architecture

Instead, each feature becomes its own service.

                Browser
                    │
                    ▼
              NGINX Ingress
                    │
      ┌────────┬────────┬────────┐
      ▼        ▼        ▼
    Auth     User    Product

Each service:

Has its own source code
Runs in its own container
Can be deployed independently
Can be updated independently
Can scale independently
7. Why Docker?

A Node.js application running on your laptop may fail on another machine because of differences in:

Node.js version
Operating system
Installed packages
Environment variables

Docker packages everything the application needs into an image.

Source Code
      │
      ▼
 Dockerfile
      │
      ▼
 Docker Image
      │
      ▼
 Docker Container

Benefits include:

Consistent environments
Fast deployment
Easy sharing
Versioned images
Isolation between services
8. Why Kubernetes?

Managing a few Docker containers manually is simple. Managing dozens or hundreds is not.

Kubernetes provides:

Automatic scheduling
Automatic restarts
Service discovery
Load balancing
Scaling
Rolling updates
Self-healing

Example:

Docker

Container

Container

Container

↓

Kubernetes

Deployment

↓

ReplicaSet

↓

Pods

If a Pod crashes, Kubernetes automatically creates a replacement.

9. Overall Architecture

The final architecture for this project is shown below.

                    Internet
                        │
                        ▼
                 Browser/Postman
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
Request Flow
A client sends a request.
NGINX Ingress receives the request.
Ingress routes it to the appropriate Kubernetes Service.
The Service forwards it to a Pod.
The Node.js application processes the request.
If needed, it communicates with MongoDB Atlas.
The response is returned to the client.
10. Kubernetes Components Used
Component	Purpose
Deployment	Manages Pods
Pod	Runs a container
Service	Exposes Pods internally
ClusterIP	Internal networking
Ingress	External routing
ConfigMap	Non-sensitive configuration
Secret	Sensitive configuration
Horizontal Pod Autoscaler	Automatic scaling
11. What You Will Build

By the end of this guide, you will have:

Three production-style Node.js microservices
Docker images published to Docker Hub
Kubernetes Deployments and Services
DNS-based communication between services
NGINX Ingress for routing
MongoDB Atlas integration
JWT-secured APIs
Health checks with readiness and liveness probes
Horizontal Pod Autoscaling
Rolling updates and rollback support
Helm chart packaging
GitHub Actions CI/CD pipeline
12. Prerequisites

Before starting, ensure you have:

Node.js 22 or later
Docker Desktop with Kubernetes enabled
kubectl
Helm
Git
VS Code
Docker Hub account
MongoDB Atlas account
GitHub account

Verify your tools:

node -v
npm -v
docker version
kubectl version --client
helm version
git --version
Chapter Summary

In this chapter, we learned:

Why microservices are preferred over monolithic applications.
The role of Docker in packaging applications.
How Kubernetes manages containers at scale.
The high-level architecture of the project.
The technologies and tools we'll use.
The goals and expected outcomes of the implementation.

In the next chapter, we'll set up the development environment, create the project structure, initialize the three Node.js services, and verify that everything is ready before moving on to Docker and Kubernetes.