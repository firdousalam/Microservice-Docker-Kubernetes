Chapter 11 – Logging, Monitoring with Prometheus & Grafana
Building Production-Ready Node.js Microservices using Docker, Kubernetes, Helm & CI/CD
Chapter Overview

Congratulations! At this stage, you have successfully built a production-style microservices application with:

✅ Node.js Microservices
✅ Docker
✅ Docker Hub
✅ Kubernetes Deployments
✅ Kubernetes Services
✅ DNS-based Service Discovery
✅ NGINX Ingress
✅ MongoDB Atlas
✅ Kubernetes Secrets & ConfigMaps
✅ JWT Authentication
✅ Health Checks
✅ Horizontal Pod Autoscaler (HPA)
✅ Rolling Updates

Your application is now running successfully in Kubernetes.

But there's one important question:

How do you know if your application is healthy without logging into each Pod?

Production systems rely on observability, which consists of three pillars:

Logging – What happened?
Monitoring (Metrics) – How is the application performing?
Tracing – Where is the request spending time?

In this chapter, we'll focus on the first two:

Centralized Logging
Prometheus
Grafana

By the end of this chapter, you'll be able to monitor your Kubernetes cluster just like production teams.

What is Logging?

Every application generates logs.

For example:

User Login Success

JWT Generated

MongoDB Connected

User Created

Product Added

Payment Completed

Error: Database Timeout

Without logs, debugging production issues becomes extremely difficult.

Logging Architecture
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

In this chapter, we'll use Kubernetes' built-in logging. Later, you can extend it with centralized logging solutions like EFK or Loki.

Step 1 – Generate Useful Application Logs

Instead of only using console.log(), log meaningful events.

Example (auth-service/index.js):

app.post("/login", (req, res) => {

    console.log("Login request received");

    // Validate user

    console.log("JWT generated successfully");

    res.json({
        token
    });

});

Similarly, log important events in:

User Service
console.log("Creating new user");
console.log("Fetching user details");
console.log("User updated");
Product Service
console.log("Fetching products");
console.log("Adding product");
console.log("MongoDB Connected");
Logging Best Practices

Avoid:

console.log("Error");

Instead:

console.log({
    service: "Auth Service",
    endpoint: "/login",
    message: "JWT Generated",
    timestamp: new Date()
});

Better yet, use JSON logging:

console.log(JSON.stringify({
    service: "Auth Service",
    event: "User Login",
    status: "SUCCESS",
    timestamp: new Date()
}));

This format is easier for monitoring tools to parse.

Step 2 – Rebuild and Push the Images

After updating your application code:

docker build -t firdousalam2058/auth-service:v7 .
docker push firdousalam2058/auth-service:v7

Repeat for:

user-service
product-service

Update your Kubernetes Deployments and apply them.

Step 3 – View Pod Logs

List Pods:

kubectl get pods

Example:

auth-deployment-7df4dd89df-k9sjd

View logs:

kubectl logs auth-deployment-7df4dd89df-k9sjd

Example:

MongoDB Connected

Server running on port 3000

Login request received

JWT generated
Issue We Encountered During the Project

We initially tried:

kubectl logs auth-pod

Result:

Error from server (NotFound)

pods "auth-pod" not found
Why?

auth-pod was not the actual Pod name.

Pods receive generated names such as:

auth-deployment-79479949d8-qvl48
Correct Workflow

First:

kubectl get pods

Then:

kubectl logs auth-deployment-79479949d8-qvl48

This is the exact issue we encountered during implementation.

Step 4 – Stream Logs

Instead of reading completed logs, stream them live:

kubectl logs -f auth-deployment-79479949d8-qvl48

Now, make requests to:

http://localhost:8080/auth

The terminal updates in real time.

Stop streaming with:

Ctrl + C
Step 5 – View Logs for All Containers

If a Pod contains multiple containers:

kubectl logs <pod-name> -c auth

Example:

kubectl logs auth-deployment-79479949d8-qvl48 -c auth
Monitoring

Logs tell us what happened.

Monitoring tells us:

CPU usage
Memory usage
Network traffic
Pod restarts
Request rate
Response time

For this, Kubernetes commonly uses Prometheus.

Monitoring Architecture
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
What is Prometheus?

Prometheus is an open-source monitoring system.

It:

Collects metrics
Stores time-series data
Queries metrics
Sends alerts
Integrates with Grafana

Prometheus pulls metrics from applications rather than waiting for them to push metrics.

What is Grafana?

Grafana is a visualization platform.

It creates dashboards showing:

CPU Usage
Memory Usage
Pod Count
HTTP Requests
Response Time
Error Rate
Cluster Health

Prometheus stores the metrics, while Grafana displays them.

Step 6 – Install Prometheus

The easiest way is to use Helm.

Add the Prometheus Helm repository:

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

Update repositories:

helm repo update

Install Prometheus:

helm install prometheus prometheus-community/kube-prometheus-stack

Verify installation:

kubectl get pods

You should see Pods such as:

prometheus-server

grafana

alertmanager
Step 7 – Verify Installation

List all Pods:

kubectl get pods -A

Expected:

prometheus-server

grafana

node-exporter

kube-state-metrics
Step 8 – Access Grafana

Find the Grafana Service:

kubectl get svc

If you're using Docker Desktop, port-forward the Grafana Service:

kubectl port-forward svc/prometheus-grafana 3000:80

Open:

http://localhost:3000

Default credentials:

Username

admin

Password

prom-operator

Note: Depending on the chart version, the password may differ. You can retrieve it with:

kubectl get secret prometheus-grafana -o jsonpath="{.data.admin-password}" | base64 --decode
Step 9 – Explore Grafana Dashboards

Useful dashboards include:

Kubernetes Cluster Overview
Node Metrics
Pod Metrics
Deployment Metrics
CPU Usage
Memory Usage
Network Traffic
Pod Restarts
Step 10 – Monitor CPU Usage

Generate some traffic to your application.

Open several browser tabs or use a load-testing tool.

Then, observe:

CPU spikes
Memory usage
Number of Pods
Request count

These metrics update automatically.

Step 11 – Observe HPA Metrics

Since you configured the HPA in the previous chapter, watch how it behaves:

kubectl get hpa -w

Generate load and observe:

Current CPU

↓

Replica Count

↓

Pods Increase

↓

Traffic Distributed

This demonstrates autoscaling in action.

Step 12 – View Node Resource Usage

Use:

kubectl top nodes

Example:

NAME

CPU%

MEMORY%

View Pod usage:

kubectl top pods

Example:

NAME

CPU

MEMORY

These metrics are provided by the Metrics Server installed earlier.

Useful Commands

View logs:

kubectl logs <pod-name>

Stream logs:

kubectl logs -f <pod-name>

View Pods:

kubectl get pods

Describe a Pod:

kubectl describe pod <pod-name>

View CPU usage:

kubectl top pods

View node metrics:

kubectl top nodes

Watch the HPA:

kubectl get hpa -w

List all resources:

kubectl get all
Common Issues We Encountered
1. Pod Not Found

Error:

pods "auth-pod" not found

Solution:

Always list Pods first:

kubectl get pods

Then use the actual Pod name.

2. kubectl top pods Returns an Error

Cause:

The Metrics Server is not installed or not running.

Solution:

Install the Metrics Server and verify:

kubectl get deployment metrics-server -n kube-system
3. Grafana Doesn't Open

Cause:

The Service isn't exposed.

Solution:

Use port forwarding:

kubectl port-forward svc/prometheus-grafana 3000:80
4. No Data Appears in Grafana

Cause:

Prometheus hasn't collected enough metrics yet.

Solution:

Generate traffic and wait a few minutes for metrics to populate.

Best Practices
Use structured (JSON) logging.
Include timestamps in log entries.
Log only meaningful events.
Avoid logging sensitive data such as passwords or JWTs.
Monitor CPU, memory, and Pod health continuously.
Set alerts for high CPU usage, frequent Pod restarts, and failed readiness probes.
Verify Before Moving On

Before continuing, ensure:

✅ All services produce useful logs.
✅ You can retrieve logs with kubectl logs.
✅ Live log streaming works.
✅ Metrics Server is operational.
✅ Prometheus is collecting metrics.
✅ Grafana dashboards display cluster metrics.
✅ CPU and memory usage are visible.
✅ HPA metrics update when load changes.
Chapter Summary

In this chapter, we implemented logging and monitoring for our Kubernetes-based microservices. We learned how to view and stream Pod logs, structured our application logs for easier analysis, installed Prometheus and Grafana using Helm, and monitored CPU, memory, and Pod metrics. These capabilities are essential for operating and troubleshooting applications in production.

What's Next?

In Chapter 12 – Packaging the Application with Helm & Automating Deployments Using GitHub Actions CI/CD, we'll package all Kubernetes manifests into a reusable Helm chart, parameterize configurations with values.yaml, and build a complete CI/CD pipeline that automatically builds Docker images, pushes them to Docker Hub, and performs rolling updates in Kubernetes whenever code is pushed to GitHub. This will complete your end-to-end production-ready microservices workflow.