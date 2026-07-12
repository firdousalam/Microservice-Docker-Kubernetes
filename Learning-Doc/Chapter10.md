Chapter 10 – Scaling, Horizontal Pod Autoscaler (HPA) & Rolling Updates
Building Production-Ready Node.js Microservices using Docker, Kubernetes, Helm & CI/CD
Chapter Overview

Our microservices are now production-ready in terms of:

✅ Docker Containers
✅ Kubernetes Deployments
✅ Services
✅ NGINX Ingress
✅ MongoDB Atlas
✅ ConfigMaps & Secrets
✅ JWT Authentication
✅ Health Checks

However, production systems must also handle increasing traffic and application updates without downtime.

Imagine your application receives:

100 users today
10,000 users tomorrow
100,000 users next month

A single Pod cannot handle unlimited traffic. Kubernetes solves this with horizontal scaling, where multiple Pod replicas run behind a Service.

In addition, deploying a new application version should not interrupt users. Kubernetes provides Rolling Updates to replace Pods gradually and Rollbacks to restore the previous version if something goes wrong.

By the end of this chapter, you'll learn how to:

Scale Deployments manually
Configure a Horizontal Pod Autoscaler (HPA)
Understand Metrics Server requirements
Perform Rolling Updates
Roll back failed deployments
Monitor rollout status
Troubleshoot common scaling issues
Scaling in Kubernetes

Instead of increasing CPU or memory for one Pod (vertical scaling), Kubernetes commonly uses horizontal scaling.

                Browser Requests
                       │
                       ▼
               Kubernetes Service
                       │
      ┌────────────────┼────────────────┐
      ▼                ▼                ▼
   Auth Pod 1      Auth Pod 2      Auth Pod 3

The Service automatically load-balances requests across all healthy Pods.

Manual Scaling

Initially:

Replicas = 1

After scaling:

Replicas = 3
Step 1 – Check the Current Deployment

View Deployments:

kubectl get deployments

Example:

NAME                  READY   UP-TO-DATE   AVAILABLE

auth-deployment       1/1     1            1
user-deployment       1/1     1            1
product-deployment    1/1     1            1
Step 2 – Scale the Auth Service

Run:

kubectl scale deployment auth-deployment --replicas=3

Expected output:

deployment.apps/auth-deployment scaled
Step 3 – Verify the Pods
kubectl get pods

Expected:

NAME                                  READY

auth-deployment-xxxxx                 1/1

auth-deployment-yyyyy                 1/1

auth-deployment-zzzzz                 1/1

user-deployment-xxxxx                 1/1

product-deployment-xxxxx              1/1

Three Auth Pods should now be running.

Step 4 – Verify the Deployment
kubectl get deployment auth-deployment

Expected:

READY

3/3
How Load Balancing Works

You do not need to change your Service.

The Service automatically distributes traffic.

               Browser
                  │
                  ▼
           auth-service
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
      Pod 1     Pod 2     Pod 3
Scaling Back Down

Reduce the replicas:

kubectl scale deployment auth-deployment --replicas=1

Verify:

kubectl get pods

Only one Auth Pod should remain.

Horizontal Pod Autoscaler (HPA)

Manual scaling works, but it requires human intervention.

A Horizontal Pod Autoscaler (HPA) automatically adjusts the number of Pods based on resource usage, such as CPU utilization.

Example:

CPU Usage

20% → 2 Pods

50% → 3 Pods

70% → 5 Pods

90% → 8 Pods
How HPA Works
                 Metrics Server
                       │
                       ▼
          Horizontal Pod Autoscaler
                       │
            CPU Utilization = 80%
                       │
                       ▼
          Increase Replicas from 2 → 5
Step 5 – Install Metrics Server

HPA requires the Kubernetes Metrics Server.

Verify if it's installed:

kubectl get deployment metrics-server -n kube-system

If it is not installed, apply the official manifest:

kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

Wait until:

kubectl get pods -n kube-system

shows:

metrics-server

Running
Step 6 – Verify Metrics
kubectl top nodes

Example:

NAME

CPU

MEMORY

docker-desktop

12%

42%

Check Pods:

kubectl top pods

If these commands work, HPA can collect CPU metrics.

Step 7 – Configure Resource Requests and Limits

HPA uses CPU utilization relative to the Pod's resource requests. Therefore, define CPU and memory requests in your Deployment.

Example (auth-deployment.yaml):

resources:
  requests:
    cpu: "100m"
    memory: "128Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"

Without these values, the HPA cannot calculate CPU utilization correctly.

Apply the updated Deployment:

kubectl apply -f auth-deployment.yaml
Step 8 – Create the HPA

During our implementation, the old command:

kubectl autoscale deployment auth-deployment --cpu-percent=70 --min=2 --max=10

returned:

Flag --cpu-percent has been deprecated

The correct command for newer Kubernetes versions is:

kubectl autoscale deployment auth-deployment \
  --cpu=70% \
  --min=2 \
  --max=10

Expected:

horizontalpodautoscaler.autoscaling/auth-deployment created
Issue We Encountered

When we ran the command again, Kubernetes returned:

Error from server (AlreadyExists):

horizontalpodautoscalers.autoscaling

"auth-deployment"

already exists
Cause

The HPA had already been created.

Solution

List the HPAs:

kubectl get hpa

Describe it:

kubectl describe hpa auth-deployment

If you need to recreate it:

kubectl delete hpa auth-deployment

Then create it again.

Step 9 – Monitor the HPA

View the autoscaler:

kubectl get hpa

Example:

NAME                REFERENCE                    TARGETS   MINPODS   MAXPODS

auth-deployment     Deployment/auth-deployment  25%/70%   2         10

The TARGETS column shows current CPU usage versus the target.

Step 10 – Generate Load (Optional)

To observe autoscaling, generate CPU load.

For learning purposes, you can use tools such as:

ApacheBench (ab)
hey
wrk

Example:

hey -n 10000 -c 100 http://localhost:8080/auth

As CPU usage increases, the HPA should create additional Pods.

Rolling Updates

A Rolling Update replaces Pods gradually, ensuring that the application remains available.

Current version:

auth-service:v5

New version:

auth-service:v6

Kubernetes starts new Pods before terminating the old ones.

Rolling Update Flow
Old Pods (v5)

▼

New Pod (v6)

▼

Traffic shifts

▼

Old Pod removed

▼

Repeat until complete
Step 11 – Build a New Image
docker build -t firdousalam2058/auth-service:v6 .

Push:

docker push firdousalam2058/auth-service:v6
Step 12 – Update the Deployment

Edit auth-deployment.yaml:

image: firdousalam2058/auth-service:v6

Apply:

kubectl apply -f auth-deployment.yaml

Alternatively, update the image directly:

kubectl set image deployment/auth-deployment \
auth=firdousalam2058/auth-service:v6
Step 13 – Monitor the Rollout
kubectl rollout status deployment auth-deployment

Expected:

deployment "auth-deployment" successfully rolled out

Watch the Pods:

kubectl get pods -w

You'll see new Pods created before the old ones are terminated.

Step 14 – Roll Back a Deployment

If the new version contains a bug, restore the previous version:

kubectl rollout undo deployment auth-deployment

Verify:

kubectl rollout history deployment auth-deployment
Step 15 – Restart a Deployment

If you update a Secret or ConfigMap, restart the Pods:

kubectl rollout restart deployment auth-deployment
Useful Commands

View Deployments:

kubectl get deployments

Scale manually:

kubectl scale deployment auth-deployment --replicas=3

View Pods:

kubectl get pods

View HPAs:

kubectl get hpa

Describe an HPA:

kubectl describe hpa auth-deployment

Delete an HPA:

kubectl delete hpa auth-deployment

Monitor rollout:

kubectl rollout status deployment auth-deployment

View rollout history:

kubectl rollout history deployment auth-deployment

Undo a rollout:

kubectl rollout undo deployment auth-deployment

Restart a Deployment:

kubectl rollout restart deployment auth-deployment
Common Issues We Encountered
1. --cpu-percent Deprecated

We encountered:

Flag --cpu-percent has been deprecated

Solution

Use:

kubectl autoscale deployment auth-deployment \
--cpu=70% \
--min=2 \
--max=10
2. AlreadyExists

We encountered:

horizontalpodautoscalers.autoscaling

already exists

Solution

Check the existing HPA:

kubectl get hpa

Delete and recreate it if necessary.

3. HPA Shows <unknown> for CPU

Cause

Metrics Server isn't running.
CPU requests are missing from the Deployment.

Solution

Install the Metrics Server.
Add resources.requests.cpu to the Deployment.
4. New Pods Never Start

Cause

Image doesn't exist in Docker Hub.
Incorrect image tag.
Failed image pull.

Solution

Verify the image:

docker push firdousalam2058/auth-service:v6

Check Pod events:

kubectl describe pod <pod-name>
5. Rolling Update Gets Stuck

Cause

The new Pods fail their readiness probe.

Solution

Check:

kubectl logs <pod-name>
kubectl describe pod <pod-name>

Resolve the issue or roll back the Deployment.

Best Practices
Use HPA instead of manual scaling in production.
Always define CPU and memory requests and limits.
Verify Metrics Server before configuring HPA.
Monitor every rollout with kubectl rollout status.
Test new versions in a staging environment before production.
Keep previous Deployment revisions available for quick rollback.
Verify Before Moving On

Before continuing, ensure:

✅ Manual scaling works.
✅ Multiple replicas are created successfully.
✅ The Service load-balances traffic.
✅ Metrics Server is running.
✅ The HPA is created and visible with kubectl get hpa.
✅ Resource requests and limits are configured.
✅ Rolling updates complete successfully.
✅ Rollbacks restore the previous version when required.
Chapter Summary

In this chapter, we learned how to scale Kubernetes Deployments manually and automatically using the Horizontal Pod Autoscaler. We configured CPU resource requests, addressed the HPA issues encountered during implementation, and explored rolling updates and rollbacks to achieve zero-downtime deployments.

What's Next?

In Chapter 11 – Logging, Monitoring with Prometheus & Grafana, we'll learn how to collect application logs, monitor Kubernetes clusters with Prometheus, visualize metrics in Grafana, and create dashboards to monitor CPU, memory, request rates, and Pod health in real time. This is a key step toward operating microservices in a production environment.