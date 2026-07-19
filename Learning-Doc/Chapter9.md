# Chapter 9 – Health Checks, Readiness & Liveness Probes

# Building Production-Ready Node.js Microservices using Docker, Kubernetes, Helm & CI/CD

---

# Chapter Overview

Our application is now fully functional:

- ✅ Three Node.js microservices
- ✅ Dockerized applications
- ✅ Kubernetes Deployments and Services
- ✅ NGINX Ingress
- ✅ MongoDB Atlas integration
- ✅ JWT Authentication

However, what happens if one of the services crashes?

For example:

- Node.js process hangs
- MongoDB becomes unreachable
- The application enters an infinite loop
- A Pod starts before the application is ready

Without health checks, Kubernetes assumes the Pod is healthy as long as the container is running. This can cause requests to fail because traffic is still sent to an unhealthy application.

To solve this, Kubernetes provides **Health Probes**.

In this chapter, we'll implement:

- Health Endpoint
- Readiness Probe
- Liveness Probe

By the end of this chapter, Kubernetes will automatically:

- Detect unhealthy Pods
- Stop sending traffic to unhealthy Pods
- Restart failed containers
- Improve application availability

---

# Understanding Kubernetes Health Probes

Kubernetes supports three types of probes:

| Probe | Purpose | What Kubernetes Does |
|--------|---------|----------------------|
| Startup Probe | Checks whether the application has started | Prevents early failures during startup |
| Readiness Probe | Checks whether the application is ready to receive traffic | Removes unhealthy Pods from the Service |
| Liveness Probe | Checks whether the application is still running correctly | Restarts unhealthy containers |

For this project, we will implement **Readiness** and **Liveness** probes.

---

# Why Are Health Checks Important?

Imagine your User Service takes **30 seconds** to connect to MongoDB Atlas.

Without a readiness probe:

```text
Browser
    │
    ▼
Service
    │
    ▼
Pod (Still Starting)
    │
    ▼
Connection Failed
```

The Pod is running, but the application isn't ready yet.

With a readiness probe:

```text
Browser
    │
    ▼
Service
    │
    ▼
Only Ready Pods
```

Kubernetes waits until the application is healthy before sending requests.

---

# Application Architecture

```text
                 Browser
                    │
                    ▼
             NGINX Ingress
                    │
        ┌───────────┼────────────┐
        ▼           ▼            ▼
   Auth Service  User Service  Product Service
        │           │            │
        ▼           ▼            ▼
      /health     /health      /health
        │           │            │
        ▼           ▼            ▼
 Kubernetes Health Probes
```

---

# Step 1 – Create a Health Endpoint

Every microservice should expose a **/health** endpoint.

### Product Service

```javascript
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        service: "Product Service",
        timestamp: new Date()
    });
});
```

### Auth Service

```javascript
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        service: "Auth Service"
    });
});
```

### User Service

```javascript
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        service: "User Service"
    });
});
```

---

# Step 2 – Test the Endpoint Locally

Run the application:

```bash
npm start
```

Open:

```text
http://localhost:3000/health
```

Expected response:

```json
{
  "status": "UP",
  "service": "Auth Service"
}
```

Similarly test:

```text
http://localhost:3001/health

http://localhost:3002/health
```

---

# Step 3 – Rebuild the Docker Images

Since the application code has changed, rebuild and push the Docker images.

### Auth Service

```bash
docker build -t firdousalam2058/auth-service:v5 .
docker push firdousalam2058/auth-service:v5
```

### User Service

```bash
docker build -t firdousalam2058/user-service:v5 .
docker push firdousalam2058/user-service:v5
```

### Product Service

```bash
docker build -t firdousalam2058/product-service:v5 .
docker push firdousalam2058/product-service:v5
```

---

# Step 4 – Update Kubernetes Deployments

Update the image version inside each Deployment.

Example:

```yaml
containers:
- name: product
  image: firdousalam2058/product-service:v5

  ports:
    - containerPort: 3002
```

Repeat for:

- auth-deployment.yaml
- user-deployment.yaml

Apply the changes:

```bash
kubectl apply -f auth-deployment.yaml
kubectl apply -f user-deployment.yaml
kubectl apply -f product-deployment.yaml
```

---

# Step 5 – Add Readiness Probe

Inside each Deployment YAML, under the container definition:

```yaml
readinessProbe:
  httpGet:
    path: /health
    port: 3002

  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 2
  failureThreshold: 3
```

### Explanation

| Property | Description |
|-----------|-------------|
| path | Endpoint Kubernetes calls |
| port | Application port |
| initialDelaySeconds | Wait before first check |
| periodSeconds | Probe interval |
| timeoutSeconds | Maximum response time |
| failureThreshold | Consecutive failures before marking Pod Not Ready |

Use:

- Port **3000** for Auth Service
- Port **3001** for User Service
- Port **3002** for Product Service

---

# Step 6 – Add Liveness Probe

Below the readiness probe:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3002

  initialDelaySeconds: 20
  periodSeconds: 10
  timeoutSeconds: 2
  failureThreshold: 3
```

### Explanation

| Property | Description |
|-----------|-------------|
| path | Health endpoint |
| port | Application port |
| initialDelaySeconds | Delay before first liveness check |
| periodSeconds | Probe interval |
| timeoutSeconds | Maximum response time |
| failureThreshold | Restart after consecutive failures |

Update the port for the Auth and User services.

---

# Where Should These Probes Be Added?

During implementation, one common question was:

> **"Where do I add the readinessProbe and livenessProbe?"**

They must be placed **inside the `containers` section** of each Deployment.

Example:

```yaml
spec:
  template:
    spec:
      containers:
      - name: product
        image: firdousalam2058/product-service:v5

        ports:
        - containerPort: 3002

        readinessProbe:
          httpGet:
            path: /health
            port: 3002
          initialDelaySeconds: 10
          periodSeconds: 5

        livenessProbe:
          httpGet:
            path: /health
            port: 3002
          initialDelaySeconds: 20
          periodSeconds: 10
```

Repeat for the Auth and User Deployments.

---

# Step 7 – Apply the Changes

```bash
kubectl apply -f auth-deployment.yaml
kubectl apply -f user-deployment.yaml
kubectl apply -f product-deployment.yaml
```

---

# Step 8 – Verify the Deployment

```bash
kubectl get pods
```

Expected output:

```text
NAME                                   READY   STATUS
auth-deployment-xxxxxxxxxx             1/1     Running
user-deployment-xxxxxxxxxx             1/1     Running
product-deployment-xxxxxxxxxx          1/1     Running
```

---

# Step 9 – Inspect the Probes

Verify that Kubernetes has registered the probes:

```bash
kubectl describe pod <product-pod-name>
```

Look for:

```text
Readiness: http-get http://:3002/health
Liveness:  http-get http://:3002/health
```

---

# Step 10 – Test the Health Endpoint Through Ingress

If Ingress is configured correctly, test:

```text
http://localhost:8080/product/health

http://localhost:8080/auth/health

http://localhost:8080/user/health
```

Expected response:

```json
{
  "status": "UP",
  "service": "Product Service"
}
```

---

# Step 11 – Simulate a Failure (Optional)

Temporarily modify the `/health` endpoint:

```javascript
res.status(500).send("Service Down");
```

Rebuild and redeploy the service.

Watch the Pods:

```bash
kubectl get pods -w
```

After several failed health checks, Kubernetes will restart the container automatically.

Restore the endpoint to return **HTTP 200 OK** after testing.

---

# Useful Commands

### Check Pods

```bash
kubectl get pods
```

### Describe a Pod

```bash
kubectl describe pod <pod-name>
```

### View Logs

```bash
kubectl logs <pod-name>
```

### Watch Pods

```bash
kubectl get pods -w
```

### Restart a Deployment

```bash
kubectl rollout restart deployment product-deployment
```

### Check Rollout Status

```bash
kubectl rollout status deployment product-deployment
```

---

# Common Issues We Encountered

## 1. Health Endpoint Returns 404

### Cause

The `/health` route was not added to the application.

### Solution

- Implement the route.
- Rebuild the Docker image.
- Push the image.
- Update the Deployment.

---

## 2. Readiness Probe Fails Immediately

### Cause

The application needs more time to start or connect to MongoDB Atlas.

### Solution

Increase:

```yaml
initialDelaySeconds: 20
```

---

## 3. Pod Continuously Restarts

### Cause

The liveness probe is receiving non-200 responses.

### Solution

Verify:

- `/health` returns HTTP 200
- Correct application port
- Application startup completed
- MongoDB connection isn't blocking startup

---

## 4. Health Endpoint Works Locally but Fails in Kubernetes

### Cause

Kubernetes is still running an older Docker image.

### Solution

```bash
docker build -t firdousalam2058/product-service:v5 .
docker push firdousalam2058/product-service:v5

kubectl apply -f product-deployment.yaml

kubectl rollout restart deployment product-deployment
```

---

# Best Practices

- Keep `/health` lightweight.
- Avoid expensive database queries.
- Return **HTTP 200** only when the application is healthy.
- Configure separate Readiness and Liveness probes.
- Tune probe timings based on startup time.
- Verify probes after every deployment.

---

# Verify Before Moving On

Ensure:

- ✅ All services expose `/health`
- ✅ Readiness probes are configured
- ✅ Liveness probes are configured
- ✅ Pods remain in `Running` state
- ✅ `/health` returns HTTP 200
- ✅ `kubectl describe pod` shows both probes
- ✅ Kubernetes automatically restarts unhealthy containers

---

# Chapter Summary

In this chapter, we improved the resilience of our microservices by implementing health endpoints and configuring Kubernetes **Readiness** and **Liveness** probes. Kubernetes now routes traffic only to healthy Pods and automatically restarts failed containers, increasing the overall reliability and availability of the application.

---

# What's Next?

In **Chapter 10 – Scaling, Horizontal Pod Autoscaler (HPA) & Rolling Updates**, we'll learn how to:

- Scale Deployments horizontally
- Configure Horizontal Pod Autoscaler (HPA)
- Perform zero-downtime Rolling Updates
- Roll back deployments safely

These production-grade capabilities allow Kubernetes to handle increasing traffic while deploying new application versions with minimal downtime.