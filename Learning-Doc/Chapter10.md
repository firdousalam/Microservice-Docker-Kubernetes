# Chapter 10 – Scaling, Horizontal Pod Autoscaler (HPA) & Rolling Updates

# Building Production-Ready Node.js Microservices using Docker, Kubernetes, Helm & CI/CD

---

# Chapter Overview

Our microservices are now production-ready in terms of:

- ✅ Docker Containers
- ✅ Kubernetes Deployments
- ✅ Services
- ✅ NGINX Ingress
- ✅ MongoDB Atlas
- ✅ ConfigMaps & Secrets
- ✅ JWT Authentication
- ✅ Health Checks

However, production systems must also handle increasing traffic and application updates **without downtime**.

Imagine your application receives:

- 100 users today
- 10,000 users tomorrow
- 100,000 users next month

A single Pod cannot handle unlimited traffic. Kubernetes solves this with **horizontal scaling**, where multiple Pod replicas run behind a Service.

In addition, deploying a new application version should not interrupt users. Kubernetes provides **Rolling Updates** to replace Pods gradually and **Rollbacks** to restore the previous version if something goes wrong.

By the end of this chapter, you'll learn how to:

- Scale Deployments manually
- Configure a Horizontal Pod Autoscaler (HPA)
- Understand Metrics Server requirements
- Perform Rolling Updates
- Roll back failed deployments
- Monitor rollout status
- Troubleshoot common scaling issues

---

# Scaling in Kubernetes

Instead of increasing CPU or memory for one Pod (**vertical scaling**), Kubernetes commonly uses **horizontal scaling**.

```text
                Browser Requests
                       │
                       ▼
               Kubernetes Service
                       │
      ┌────────────────┼────────────────┐
      ▼                ▼                ▼
   Auth Pod 1      Auth Pod 2      Auth Pod 3
```

The Service automatically load-balances requests across all healthy Pods.

### Manual Scaling

Initially:

```text
Replicas = 1
```

After scaling:

```text
Replicas = 3
```

---

# Step 1 – Check the Current Deployment

View Deployments:

```bash
kubectl get deployments
```

Example:

```text
NAME                  READY   UP-TO-DATE   AVAILABLE

auth-deployment       1/1     1            1
user-deployment       1/1     1            1
product-deployment    1/1     1            1
```

---

# Step 2 – Scale the Auth Service

Run:

```bash
kubectl scale deployment auth-deployment --replicas=3
```

Expected output:

```text
deployment.apps/auth-deployment scaled
```

---

# Step 3 – Verify the Pods

```bash
kubectl get pods
```

Expected:

```text
NAME                                  READY

auth-deployment-xxxxx                 1/1
auth-deployment-yyyyy                 1/1
auth-deployment-zzzzz                 1/1
user-deployment-xxxxx                 1/1
product-deployment-xxxxx              1/1
```

Three Auth Pods should now be running.

---

# Step 4 – Verify the Deployment

```bash
kubectl get deployment auth-deployment
```

Expected:

```text
READY

3/3
```

---

# How Load Balancing Works

You do **not** need to modify your Kubernetes Service.

The Service automatically distributes requests among all healthy Pods.

```text
               Browser
                  │
                  ▼
           auth-service
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
      Pod 1     Pod 2     Pod 3
```

---

# Scaling Back Down

Reduce the replicas:

```bash
kubectl scale deployment auth-deployment --replicas=1
```

Verify:

```bash
kubectl get pods
```

Only one Auth Pod should remain.

---

# Horizontal Pod Autoscaler (HPA)

Manual scaling works, but it requires human intervention.

A **Horizontal Pod Autoscaler (HPA)** automatically adjusts the number of Pods based on CPU utilization.

Example:

| CPU Usage | Pods |
|-----------|------|
| 20% | 2 |
| 50% | 3 |
| 70% | 5 |
| 90% | 8 |

---

# How HPA Works

```text
                 Metrics Server
                       │
                       ▼
          Horizontal Pod Autoscaler
                       │
            CPU Utilization = 80%
                       │
                       ▼
          Increase Replicas from 2 → 5
```

---

# Step 5 – Install Metrics Server

HPA requires the Kubernetes **Metrics Server**.

Verify:

```bash
kubectl get deployment metrics-server -n kube-system
```

If it isn't installed:

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

Verify:

```bash
kubectl get pods -n kube-system
```

Expected:

```text
metrics-server     Running
```

---

# Step 6 – Verify Metrics

Check Node metrics:

```bash
kubectl top nodes
```

Example:

```text
NAME               CPU      MEMORY

docker-desktop     12%      42%
```

Check Pod metrics:

```bash
kubectl top pods
```

If both commands work successfully, HPA can collect CPU metrics.
```bash
 kubectl top pods
 ```
error: Metrics API not available

```bash
 kubectl top nodes
 ```
error: Metrics API not available

Step 1: Delete the current Metrics Server
kubectl delete deployment metrics-server -n kube-system

Wait until it is deleted:

kubectl get deployment -n kube-system
Step 2: Download the official manifest
curl -LO https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

Or on Windows PowerShell:

Invoke-WebRequest `
-Uri https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml `
-OutFile components.yaml
Step 3: Edit components.yaml

Find the args: section and replace it with:

args:
- --cert-dir=/tmp
- --secure-port=10250
- --kubelet-preferred-address-types=Hostname,InternalDNS,InternalIP,ExternalDNS,ExternalIP
- --kubelet-use-node-status-port
- --metric-resolution=15s
- --kubelet-insecure-tls
Step 4: Apply it
kubectl apply -f components.yaml
Step 5: Verify
kubectl get pods -n kube-system
kubectl logs -n kube-system -l k8s-app=metrics-server
kubectl top nodes

---

# Step 7 – Configure Resource Requests & Limits

HPA calculates CPU utilization relative to the Pod's CPU requests.

Example:

```yaml
resources:
  requests:
    cpu: "100m"
    memory: "128Mi"

  limits:
    cpu: "500m"
    memory: "512Mi"
```

Apply:

```bash
kubectl apply -f auth-deployment.yaml
```

---

# Step 8 – Create the HPA

During our implementation, the old command:

```bash
kubectl autoscale deployment auth-deployment --cpu-percent=70 --min=2 --max=10
```

returned:

```text
Flag --cpu-percent has been deprecated
```

Use the new syntax:

```bash
kubectl autoscale deployment auth-deployment \
  --cpu=70% \
  --min=2 \
  --max=10
```

Expected:

```text
horizontalpodautoscaler.autoscaling/auth-deployment created
```

---

# Issue We Encountered

Running the command again returned:

```text
Error from server (AlreadyExists):

horizontalpodautoscalers.autoscaling

"auth-deployment"

already exists
```

### Cause

The HPA already existed.

### Solution

View existing HPAs:

```bash
kubectl get hpa
```

Describe it:

```bash
kubectl describe hpa auth-deployment
```

Delete if required:

```bash
kubectl delete hpa auth-deployment
```

Then recreate it.

---

# Step 9 – Monitor the HPA

```bash
kubectl get hpa
```

Example:

```text
NAME                REFERENCE                    TARGETS   MINPODS   MAXPODS

auth-deployment     Deployment/auth-deployment  25%/70%   2         10
```

The **TARGETS** column shows current CPU usage versus the configured target.

---

# Step 10 – Generate Load (Optional)

To observe autoscaling, generate traffic.

Popular tools:

- ApacheBench (ab)
- hey
- wrk

Example:

```bash
hey -n 10000 -c 100 http://localhost:8080/auth
```

As CPU utilization increases, HPA should automatically create additional Pods.

---

# Rolling Updates

A Rolling Update replaces Pods gradually without downtime.

Current version:

```text
auth-service:v5
```

New version:

```text
auth-service:v6
```

Kubernetes creates new Pods before terminating old ones.

---

# Rolling Update Flow

```text
Old Pods (v5)

▼

New Pod (v6)

▼

Traffic shifts

▼

Old Pod removed

▼

Repeat until complete
```

---

# Step 11 – Build a New Image

```bash
docker build -t firdousalam2058/auth-service:v6 .
```

Push:

```bash
docker push firdousalam2058/auth-service:v6
```

---

# Step 12 – Update the Deployment

Update the Deployment YAML:

```yaml
image: firdousalam2058/auth-service:v6
```

Apply:

```bash
kubectl apply -f auth-deployment.yaml
```

Or update directly:

```bash
kubectl set image deployment/auth-deployment \
auth=firdousalam2058/auth-service:v6
```

---

# Step 13 – Monitor the Rollout

```bash
kubectl rollout status deployment auth-deployment
```

Expected:

```text
deployment "auth-deployment" successfully rolled out
```

Watch the Pods:

```bash
kubectl get pods -w
```

You will see new Pods created before old Pods are terminated.

---

# Step 14 – Roll Back a Deployment

If the new version contains a bug:

```bash
kubectl rollout undo deployment auth-deployment
```

Verify the rollout history:

```bash
kubectl rollout history deployment auth-deployment
```

---

# Step 15 – Restart a Deployment

When ConfigMaps or Secrets are updated:

```bash
kubectl rollout restart deployment auth-deployment
```

---

# Useful Commands

### View Deployments

```bash
kubectl get deployments
```

### Scale Manually

```bash
kubectl scale deployment auth-deployment --replicas=3
```

### View Pods

```bash
kubectl get pods
```

### View HPAs

```bash
kubectl get hpa
```

### Describe an HPA

```bash
kubectl describe hpa auth-deployment
```

### Delete an HPA

```bash
kubectl delete hpa auth-deployment
```

### Monitor Rollout

```bash
kubectl rollout status deployment auth-deployment
```

### View Rollout History

```bash
kubectl rollout history deployment auth-deployment
```

### Undo a Rollout

```bash
kubectl rollout undo deployment auth-deployment
```

### Restart a Deployment

```bash
kubectl rollout restart deployment auth-deployment
```

---

# Common Issues We Encountered

## 1. `--cpu-percent` Deprecated

Error:

```text
Flag --cpu-percent has been deprecated
```

### Solution

```bash
kubectl autoscale deployment auth-deployment \
--cpu=70% \
--min=2 \
--max=10
```

---

## 2. HPA Already Exists

Error:

```text
horizontalpodautoscalers.autoscaling

already exists
```

### Solution

```bash
kubectl get hpa
kubectl delete hpa auth-deployment
```

Recreate the HPA if necessary.

---

## 3. HPA Shows `<unknown>` for CPU

### Cause

- Metrics Server isn't running.
- CPU requests are missing.

### Solution

- Install Metrics Server.
- Configure `resources.requests.cpu`.

---

## 4. New Pods Never Start

### Cause

- Docker image not pushed.
- Incorrect image tag.
- Failed image pull.

### Solution

Push the image:

```bash
docker push firdousalam2058/auth-service:v6
```

Inspect Pod events:

```bash
kubectl describe pod <pod-name>
```

---

## 5. Rolling Update Gets Stuck

### Cause

The new Pods fail their Readiness Probe.

### Solution

Inspect logs:

```bash
kubectl logs <pod-name>

kubectl describe pod <pod-name>
```

Fix the issue or roll back the Deployment.

---

# Best Practices

- Use HPA instead of manual scaling in production.
- Always configure CPU and memory requests.
- Verify Metrics Server before creating HPAs.
- Monitor every rollout.
- Test new versions in a staging environment.
- Keep previous Deployment revisions for quick rollback.

---

# Verify Before Moving On

Ensure:

- ✅ Manual scaling works.
- ✅ Multiple replicas are created.
- ✅ Services load-balance traffic.
- ✅ Metrics Server is running.
- ✅ HPA is visible using `kubectl get hpa`.
- ✅ Resource requests and limits are configured.
- ✅ Rolling updates complete successfully.
- ✅ Rollbacks restore previous versions.

---

# Chapter Summary

In this chapter, we learned how to scale Kubernetes Deployments manually and automatically using the **Horizontal Pod Autoscaler (HPA)**. We configured CPU resource requests, resolved common HPA issues encountered during implementation, and explored Rolling Updates and Rollbacks to achieve zero-downtime deployments.

---

# What's Next?

In **Chapter 11 – Logging, Monitoring with Prometheus & Grafana**, we'll learn how to:

- Collect application logs
- Monitor Kubernetes clusters with Prometheus
- Visualize metrics in Grafana
- Build dashboards for CPU, memory, request rates, and Pod health

These tools are essential for operating microservices in a production environment.