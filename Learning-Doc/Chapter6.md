Chapter 6 – Kubernetes Ingress & Networking
Building Production-Ready Node.js Microservices using Docker, Kubernetes, Helm & CI/CD
Chapter Overview

In the previous chapter, we successfully deployed our three Node.js microservices to Kubernetes using Deployments and ClusterIP Services. While the services could communicate with each other inside the cluster, they were not accessible directly from a web browser.

In this chapter, we'll expose all three services through a single entry point using NGINX Ingress. We'll also learn how Kubernetes networking works, install the Ingress Controller, configure routing, and troubleshoot the exact networking issues we encountered during our implementation.

By the end of this chapter, you'll be able to:

Understand Kubernetes networking
Learn the role of an Ingress Controller
Install NGINX Ingress
Create an Ingress resource
Route requests to multiple services
Access services from a browser
Troubleshoot common networking issues
Kubernetes Networking

Every Pod receives its own IP address, but Pod IPs are temporary. Kubernetes solves this by introducing Services, which provide stable IPs and DNS names. To expose services outside the cluster, we use Ingress.

Browser
   │
   ▼
NGINX Ingress Controller
   │
   ├───────────────┐
   │               │
   ▼               ▼
Auth Service   User Service   Product Service
Why Do We Need Ingress?

Without Ingress:

Every service needs its own external IP or NodePort.
Managing multiple URLs becomes difficult.
SSL termination and routing are harder to configure.

With Ingress:

One entry point
Path-based routing
Host-based routing
SSL support
Load balancing

Example:

http://localhost/auth
http://localhost/user
http://localhost/product
Step 1 – Install the NGINX Ingress Controller

Docker Desktop includes Kubernetes, but you still need to install an Ingress Controller.

Install it using the official manifest:

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml

Wait a few minutes for the controller to start.

Step 2 – Verify the Controller

Check the namespace:

kubectl get pods -n ingress-nginx

Expected output:

NAME                                        READY   STATUS
ingress-nginx-controller-xxxxxxxxxx         1/1     Running

During our implementation, the controller initially showed:

STATUS

ContainerCreating

After a few minutes:

STATUS

Running
Step 3 – Verify the Service
kubectl get svc -n ingress-nginx

Expected:

NAME                          TYPE

ingress-nginx-controller       LoadBalancer

During our project, we observed:

EXTERNAL-IP

<pending>

This is expected when using Docker Desktop because there is no cloud load balancer available.

Step 4 – Create the Ingress Resource

Create a file named:

k8s/ingress.yaml

Add:

apiVersion: networking.k8s.io/v1
kind: Ingress

metadata:
  name: microservice-ingress

spec:
  ingressClassName: nginx

  rules:
  - host: localhost

    http:

      paths:

      - path: /auth
        pathType: Prefix
        backend:
          service:
            name: auth-service
            port:
              number: 3000

      - path: /user
        pathType: Prefix
        backend:
          service:
            name: user-service
            port:
              number: 3001

      - path: /product
        pathType: Prefix
        backend:
          service:
            name: product-service
            port:
              number: 3002

Apply it:

kubectl apply -f ingress.yaml
Step 5 – Verify the Ingress
kubectl get ingress

Expected:

NAME                   CLASS   HOSTS

microservice-ingress   nginx   localhost

Describe the resource:

kubectl describe ingress microservice-ingress

During our implementation, the output showed:

/auth      auth-service:3000
/user      user-service:3001
/product   product-service:3002

This confirmed that the routing rules were configured correctly.

Step 6 – Why http://localhost/user Didn't Work

When we opened:

http://localhost/user

We received:

This localhost page can't be found

Even though:

Pods were running
Services existed
Ingress rules were correct
Controller was running

The issue was that Docker Desktop's Ingress Controller was not automatically bound to port 80 on the host machine.

Step 7 – Use Port Forwarding

Forward the Ingress Controller service to your local machine:

kubectl port-forward -n ingress-nginx service/ingress-nginx-controller 8080:80

Expected:

Forwarding from 127.0.0.1:8080 -> 80
Forwarding from [::1]:8080 -> 80

Keep this terminal window open while testing.

Step 8 – Test the Routes

Open your browser:

http://localhost:8080/auth

Response:

Auth Service Running

Open:

http://localhost:8080/user

Response:

User Service Running

Open:

http://localhost:8080/product

Response:

Product Service Running

During our project, these URLs worked successfully after enabling port forwarding.

Step 9 – Understanding the Request Flow
Browser
      │
      ▼
localhost:8080
      │
      ▼
Ingress Controller
      │
 ┌────┼───────────────┐
 │    │               │
 ▼    ▼               ▼
Auth  User        Product
Service Service   Service

Each incoming request is matched against the configured path and forwarded to the corresponding Kubernetes Service.

Useful Networking Commands

List Ingress resources:

kubectl get ingress

Describe an Ingress:

kubectl describe ingress microservice-ingress

Check the Ingress Controller:

kubectl get pods -n ingress-nginx

View the controller logs:

kubectl logs -n ingress-nginx deployment/ingress-nginx-controller

List services:

kubectl get svc

Check endpoints:

kubectl get endpoints
Common Issues We Solved
1. Ingress Controller Stuck in ContainerCreating

We observed:

STATUS

ContainerCreating
Cause

The image was still downloading or Kubernetes was still initializing.

Solution

Wait a few minutes and check again:

kubectl get pods -n ingress-nginx

The status eventually changed to:

Running
2. EXTERNAL-IP Stayed <pending>

We observed:

LoadBalancer

EXTERNAL-IP

<pending>
Cause

Docker Desktop does not provide a cloud load balancer.

Solution

Use port forwarding:

kubectl port-forward -n ingress-nginx service/ingress-nginx-controller 8080:80
3. http://localhost/user Returned 404

The browser displayed:

This localhost page can't be found
Cause

The Ingress Controller was not exposed on the host's port 80.

Solution

Access the services through the forwarded port:

http://localhost:8080/user
4. Verify Backend Services

If routing fails, check that the services exist:

kubectl get svc

Expected:

auth-service
user-service
product-service
5. Verify Pods
kubectl get pods

All Pods should show:

Running
6. Verify Ingress Rules
kubectl describe ingress microservice-ingress

Ensure the backend mappings point to the correct services and ports:

/auth → auth-service:3000
/user → user-service:3001
/product → product-service:3002
Best Practices
Use an Ingress instead of exposing each service individually.
Keep Services as ClusterIP when they are only accessed through the Ingress.
Use meaningful paths (/auth, /user, /product).
Verify Pods, Services, and Ingress resources before troubleshooting networking.
For local development with Docker Desktop, use kubectl port-forward when the LoadBalancer external IP is unavailable.
Verify Before Moving On

Before continuing, ensure:

✅ NGINX Ingress Controller is installed.
✅ The controller Pod is in the Running state.
✅ All three Services are ClusterIP.
✅ The Ingress resource is created successfully.
✅ Port forwarding is active.
✅ http://localhost:8080/auth works.
✅ http://localhost:8080/user works.
✅ http://localhost:8080/product works.
Chapter Summary

In this chapter, we configured Kubernetes networking using the NGINX Ingress Controller. We installed the controller, created an Ingress resource, and routed browser requests to our Auth, User, and Product services through a single endpoint. We also documented the real-world issues encountered during development—such as the controller remaining in ContainerCreating, the LoadBalancer external IP staying <pending>, and http://localhost/user returning a 404—and showed how to resolve them using kubectl port-forward.

What's Next?

In Chapter 7 – MongoDB Atlas, ConfigMaps & Secrets, we'll connect all three microservices to MongoDB Atlas, move configuration into Kubernetes ConfigMaps and Secrets, inject environment variables into Pods, and replace hard-coded values with secure, production-ready configuration.