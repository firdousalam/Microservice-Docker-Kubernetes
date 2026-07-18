# Chapter 11 – Logging, Monitoring with Prometheus & Grafana

# Building Production-Ready Node.js Microservices using Docker, Kubernetes, Helm & CI/CD

---

# Chapter Overview

Congratulations! 🎉

At this stage, you have successfully built a production-style microservices application with:

- ✅ Node.js Microservices
- ✅ Docker
- ✅ Docker Hub
- ✅ Kubernetes Deployments
- ✅ Kubernetes Services
- ✅ DNS-based Service Discovery
- ✅ NGINX Ingress
- ✅ MongoDB Atlas
- ✅ Kubernetes Secrets & ConfigMaps
- ✅ JWT Authentication
- ✅ Health Checks
- ✅ Horizontal Pod Autoscaler (HPA)
- ✅ Rolling Updates

Your application is now running successfully in Kubernetes.

But there's one important question:

> **How do you know if your application is healthy without logging into each Pod?**

Production systems rely on **Observability**, which consists of three pillars:

- **Logging** – What happened?
- **Monitoring (Metrics)** – How is the application performing?
- **Tracing** – Where is the request spending time?

In this chapter, we'll focus on:

- Centralized Logging
- Prometheus
- Grafana

By the end of this chapter, you'll be able to monitor your Kubernetes cluster just like production teams.

---

# What is Logging?

Every application generates logs.

Examples include:

- User Login Success
- JWT Generated
- MongoDB Connected
- User Created
- Product Added
- Payment Completed
- Error: Database Timeout

Without logs, debugging production issues becomes extremely difficult.

---

# Logging Architecture

```text
                   Browser
                      │
                      ▼
               NGINX Ingress
                      │
      ┌───────────────┼───────────────┐
      ▼               ▼               ▼
 Auth Service     User Service    Product Service
      │               │               │
      └───────────────┼───────────────┘
                      ▼
              Container stdout logs
                      │
                      ▼
                kubectl logs
```

In this chapter, we'll use Kubernetes' built-in logging. Later, you can extend it with centralized logging solutions like **EFK** or **Loki**.

---

# Step 1 – Generate Useful Application Logs

Instead of only using `console.log()`, log meaningful events.

Example (**auth-service/index.js**):

```javascript
app.post("/login", (req, res) => {

    console.log("Login request received");

    // Validate user

    console.log("JWT generated successfully");

    res.json({
        token
    });

});
```

Similarly, log important events in:

### User Service

```javascript
console.log("Creating new user");
console.log("Fetching user details");
console.log("User updated");
```

### Product Service

```javascript
console.log("Fetching products");
console.log("Adding product");
console.log("MongoDB Connected");
```

---

# Logging Best Practices

Avoid:

```javascript
console.log("Error");
```

Instead:

```javascript
console.log({
    service: "Auth Service",
    endpoint: "/login",
    message: "JWT Generated",
    timestamp: new Date()
});
```

Even better, use structured JSON logging:

```javascript
console.log(JSON.stringify({
    service: "Auth Service",
    event: "User Login",
    status: "SUCCESS",
    timestamp: new Date()
}));
```

This format is easier for monitoring tools to parse.

---

# Step 2 – Rebuild and Push Docker Images

After updating the application code:

```bash
docker build -t firdousalam2058/auth-service:v7 .
docker push firdousalam2058/auth-service:v7
```

Repeat for:

- user-service
- product-service

Update your Kubernetes Deployments and apply them.

kubectl apply -f user-deployment.yaml                        
deployment.apps/user-deployment configured
PS C:\Users\techn\TechnophileFirdous\Microservice-Docker-Kubernetes\MicroserviceChapterWise\k8s> kubectl apply -f product-deployment.yaml                     
deployment.apps/product-deployment configured
PS C:\Users\techn\TechnophileFirdous\Microservice-Docker-Kubernetes\MicroserviceChapterWise\k8s> kubectl apply -f auth-deployment.yaml                        
deployment.apps/auth-deployment configured
PS C:\Users\techn\TechnophileFirdous\Microservice-Docker-Kubernetes\MicroserviceChapterWise\k8s> kubectl port-forward -n ingress-nginx service/ingress-nginx-controller 8080:80

---

# Step 3 – View Pod Logs

List Pods:

```bash
kubectl get pods
```

Example:

```text
auth-deployment-7df4dd89df-k9sjd
```

View logs:

```bash
kubectl logs auth-deployment-7df4dd89df-k9sjd
```

Example output:

```text
MongoDB Connected
Server running on port 3000
Login request received
JWT generated
```

---

# Issue We Encountered During the Project

Initially we ran:

```bash
kubectl logs auth-pod
```

Result:

```text
Error from server (NotFound)

pods "auth-pod" not found
```

### Why?

`auth-pod` was not the actual Pod name.

Pods receive generated names like:

```text
auth-deployment-79479949d8-qvl48
```

Correct workflow:

```bash
kubectl get pods
```

Then:

```bash
kubectl logs auth-deployment-79479949d8-qvl48
```

---

# Step 4 – Stream Logs

View logs continuously:

```bash
kubectl logs -f auth-deployment-79479949d8-qvl48
```

Now make requests to:

```
http://localhost:8080/auth
```

Logs will update in real time.

Stop streaming:

```text
Ctrl + C
```

---

# Step 5 – View Logs for Specific Containers

If a Pod contains multiple containers:

```bash
kubectl logs <pod-name> -c auth
```

Example:

```bash
kubectl logs auth-deployment-79479949d8-qvl48 -c auth
```

---

# Monitoring

Logs tell us **what happened**.

Monitoring tells us:

- CPU usage
- Memory usage
- Network traffic
- Pod restarts
- Request rate
- Response time

For this, Kubernetes commonly uses **Prometheus**.

---

# Monitoring Architecture

```text
                  Browser
                     │
                     ▼
              NGINX Ingress
                     │
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
 Auth Service    User Service   Product Service
      │              │              │
      ▼              ▼              ▼
         Prometheus Scrapes Metrics
                     │
                     ▼
                  Prometheus
                     │
                     ▼
                  Grafana
                     │
                     ▼
              Beautiful Dashboards
```

---

# What is Prometheus?

Prometheus is an open-source monitoring system.

It:

- Collects metrics
- Stores time-series data
- Queries metrics
- Sends alerts
- Integrates with Grafana

Prometheus **pulls metrics** from applications instead of waiting for them to push metrics.

---

# What is Grafana?

Grafana is a visualization platform.

It creates dashboards showing:

- CPU Usage
- Memory Usage
- Pod Count
- HTTP Requests
- Response Time
- Error Rate
- Cluster Health

Prometheus stores the metrics, while Grafana displays them.

---

# Step 6 – Install Prometheus

Add the Helm repository:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
```

Update repositories:

```bash
helm repo update
```

Install the monitoring stack:

```bash
helm install prometheus prometheus-community/kube-prometheus-stack
```

helm repo list
NAME                    URL
prometheus-community    https://prometheus-community.github.io/helm-charts

Great! The repository is configured correctly. ✅

Now let's verify that Helm can see the Prometheus chart.

Step 1: Search for the chart

Run:

helm search repo prometheus-community/kube-prometheus-stack

You should see output similar to:

NAME                                        CHART VERSION   APP VERSION
prometheus-community/kube-prometheus-stack  xx.x.x          xx.x.x
Step 2: Install the chart

If the search succeeds, run:

helm install prometheus prometheus-community/kube-prometheus-stack



Verify:

```bash
kubectl get pods
```

Expected Pods:

- prometheus-server
- grafana
- alertmanager

---

# Step 7 – Verify Installation

```bash
kubectl get pods -A
```

Expected:

- prometheus-server
- grafana
- node-exporter
- kube-state-metrics

---

# Step 8 – Access Grafana

Find the Grafana Service:

```bash
kubectl get svc
```

Port-forward Grafana:

```bash
kubectl port-forward svc/prometheus-grafana 3000:80
```

generally port 3000 taken by some other servive
you can use another free port
kubectl port-forward svc/prometheus-grafana 3001:80

it may have different passport than default 

You're using PowerShell, so the Linux base64 command isn't available. Use the PowerShell equivalent instead.

Option 1 (Recommended): Decode the password in PowerShell

Run:

[System.Text.Encoding]::UTF8.GetString(
    [System.Convert]::FromBase64String(
        (kubectl get secret prometheus-grafana -o jsonpath="{.data.admin-password}")
    )
)

This will print the Grafana admin password.

The default username is:

admin

Open:

```
http://localhost:3000
```

Default credentials:

| Username | Password |
|----------|----------|
| admin | prom-operator |

Retrieve the password if needed:

```bash
kubectl get secret prometheus-grafana \
-o jsonpath="{.data.admin-password}" | base64 --decode
```

---

# Step 9 – Explore Grafana Dashboards

Useful dashboards:

- Kubernetes Cluster Overview
- Node Metrics
- Pod Metrics
- Deployment Metrics
- CPU Usage
- Memory Usage
- Network Traffic
- Pod Restarts

---

# Step 10 – Monitor CPU Usage

Generate traffic to your application.

Observe:

- CPU spikes
- Memory usage
- Number of Pods
- Request count

Metrics update automatically.

---

# Step 11 – Observe HPA Metrics

Watch the HPA:

```bash
kubectl get hpa -w
```

Generate load.

Observe:

```text
Current CPU
      │
      ▼
Replica Count
      │
      ▼
Pods Increase
      │
      ▼
Traffic Distributed
```

This demonstrates autoscaling in action.

---

# Step 12 – View Node Resource Usage

View node metrics:

```bash
kubectl top nodes
```

Example:

```text
NAME               CPU%   MEMORY%
docker-desktop     12%    42%
```

View Pod metrics:

```bash
kubectl top pods
```

Example:

```text
NAME                             CPU   MEMORY
auth-deployment-xxxxx            10m   90Mi
user-deployment-xxxxx            8m    85Mi
product-deployment-xxxxx         6m    70Mi
```

These metrics are provided by the **Metrics Server**.

---

# Useful Commands

### View logs

```bash
kubectl logs <pod-name>
```

### Stream logs

```bash
kubectl logs -f <pod-name>
```

### List Pods

```bash
kubectl get pods
```

### Describe a Pod

```bash
kubectl describe pod <pod-name>
```

### View Pod metrics

```bash
kubectl top pods
```

### View node metrics

```bash
kubectl top nodes
```

### Watch the HPA

```bash
kubectl get hpa -w
```

### List all resources

```bash
kubectl get all
```

---

# Common Issues We Encountered

## 1. Pod Not Found

Error:

```text
pods "auth-pod" not found
```

Solution:

```bash
kubectl get pods
```

Then use the actual Pod name.

---

## 2. `kubectl top pods` Returns an Error

Cause:

- Metrics Server is not installed.
- Metrics Server is not running.

Solution:

```bash
kubectl get deployment metrics-server -n kube-system
```

---

## 3. Grafana Doesn't Open

Cause:

The Service isn't exposed.

Solution:

```bash
kubectl port-forward svc/prometheus-grafana 3000:80
```

---

## 4. No Data Appears in Grafana

Cause:

Prometheus hasn't collected enough metrics.

Solution:

Generate traffic and wait a few minutes.

---

# Best Practices

- Use structured JSON logging.
- Include timestamps in log entries.
- Log only meaningful events.
- Never log passwords or JWT tokens.
- Monitor CPU, memory, and Pod health continuously.
- Configure alerts for high CPU usage, Pod restarts, and failed readiness probes.

---

# Verify Before Moving On

Ensure that:

- ✅ All services produce useful logs.
- ✅ `kubectl logs` works correctly.
- ✅ Live log streaming works.
- ✅ Metrics Server is operational.
- ✅ Prometheus is collecting metrics.
- ✅ Grafana dashboards display cluster metrics.
- ✅ CPU and memory usage are visible.
- ✅ HPA metrics update when load changes.

---

# Chapter Summary

In this chapter, we implemented logging and monitoring for our Kubernetes-based microservices. We learned how to view and stream Pod logs, structured our application logs for easier analysis, installed Prometheus and Grafana using Helm, and monitored CPU, memory, and Pod metrics.

These capabilities are essential for operating and troubleshooting applications in production.

---

# What's Next?

In **Chapter 12 – Packaging the Application with Helm & Automating Deployments Using GitHub Actions CI/CD**, we'll:

- Package Kubernetes manifests into a reusable Helm chart.
- Parameterize configurations using `values.yaml`.
- Build a complete GitHub Actions CI/CD pipeline.
- Automatically build Docker images.
- Push images to Docker Hub.
- Perform rolling updates in Kubernetes whenever code is pushed to GitHub.

This will complete your end-to-end **production-ready microservices workflow**.