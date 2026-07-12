Chapter 9 – Health Checks, Readiness & Liveness Probes
Building Production-Ready Node.js Microservices using Docker, Kubernetes, Helm & CI/CD
Chapter Overview

Our application is now fully functional:

✅ Three Node.js microservices
✅ Dockerized applications
✅ Kubernetes Deployments and Services
✅ NGINX Ingress
✅ MongoDB Atlas integration
✅ JWT Authentication

However, what happens if one of the services crashes?

For example:

Node.js process hangs
MongoDB becomes unreachable
The application enters an infinite loop
A Pod starts before the application is ready

Without health checks, Kubernetes assumes the Pod is healthy as long as the container is running. This can cause requests to fail because traffic is still sent to an unhealthy application.

To solve this, Kubernetes provides Health Probes.

In this chapter, we'll implement:

Health Endpoint
Readiness Probe
Liveness Probe

By the end of this chapter, Kubernetes will automatically:

Detect unhealthy Pods
Stop sending traffic to unhealthy Pods
Restart failed containers
Improve application availability
Understanding Kubernetes Health Probes

Kubernetes supports three types of probes:

Probe	Purpose	What Kubernetes Does
Startup Probe	Checks whether the application has started	Prevents early failures during startup
Readiness Probe	Checks whether the application is ready to receive traffic	Removes unhealthy Pods from the Service
Liveness Probe	Checks whether the application is still running correctly	Restarts unhealthy containers

For this project, we will implement Readiness and Liveness probes.

Why Are Health Checks Important?

Imagine your User Service takes 30 seconds to connect to MongoDB Atlas.

Without a readiness probe:

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

The Pod is running, but the application isn't ready yet.

With a readiness probe:

Browser
    │
    ▼
Service
    │
    ▼
Only Ready Pods

Kubernetes waits until the application is healthy before sending requests.

Application Architecture
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
Step 1 – Create a Health Endpoint

Every microservice should expose a /health endpoint.

Example (product-service/index.js):

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        service: "Product Service",
        timestamp: new Date()
    });
});

Repeat the same for:

Auth Service
User Service

Example for Auth Service:

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        service: "Auth Service"
    });
});

Example for User Service:

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        service: "User Service"
    });
});
Step 2 – Test the Endpoint Locally

Run the application:

npm start

Open:

http://localhost:3000/health

Expected response:

{
    "status": "UP",
    "service": "Auth Service"
}

Repeat for:

http://localhost:3001/health

and

http://localhost:3002/health
Step 3 – Rebuild the Docker Images

Since the application code has changed, rebuild the images.

Auth Service:

docker build -t firdousalam2058/auth-service:v5 .
docker push firdousalam2058/auth-service:v5

User Service:

docker build -t firdousalam2058/user-service:v5 .
docker push firdousalam2058/user-service:v5

Product Service:

docker build -t firdousalam2058/product-service:v5 .
docker push firdousalam2058/product-service:v5
Step 4 – Update Kubernetes Deployments

Update each Deployment YAML.

Example (product-deployment.yaml):

containers:
- name: product
  image: firdousalam2058/product-service:v5

  ports:
    - containerPort: 3002

Repeat for:

auth-deployment.yaml
user-deployment.yaml

Apply the changes:

kubectl apply -f auth-deployment.yaml
kubectl apply -f user-deployment.yaml
kubectl apply -f product-deployment.yaml
Step 5 – Add Readiness Probe

Inside the container definition of each Deployment:

readinessProbe:
  httpGet:
    path: /health
    port: 3002

  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 2
  failureThreshold: 3
Explanation
Property	Description
path	Endpoint Kubernetes calls
port	Application port
initialDelaySeconds	Wait before first check
periodSeconds	Check interval
timeoutSeconds	Maximum response time
failureThreshold	Consecutive failures before marking Not Ready

For Auth Service, use port 3000.

For User Service, use port 3001.

Step 6 – Add Liveness Probe

Immediately below the readiness probe:

livenessProbe:
  httpGet:
    path: /health
    port: 3002

  initialDelaySeconds: 20
  periodSeconds: 10
  timeoutSeconds: 2
  failureThreshold: 3
Explanation
Property	Description
path	Endpoint used for health checks
port	Application port
initialDelaySeconds	Wait before starting liveness checks
periodSeconds	Frequency of checks
timeoutSeconds	Maximum response time
failureThreshold	Restart container after this many failures

Again, update the port for the Auth and User services.

Where Should These Probes Be Added?

During our implementation, a common question was:

"Where do I add the readinessProbe and livenessProbe?"

They must be added inside the containers section of each Deployment YAML.

Example:

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

Repeat the same structure for the Auth and User Deployments.

Step 7 – Apply the Changes
kubectl apply -f auth-deployment.yaml
kubectl apply -f user-deployment.yaml
kubectl apply -f product-deployment.yaml
Step 8 – Verify the Deployment

Check the Pods:

kubectl get pods

Expected:

NAME                                   READY   STATUS
auth-deployment-xxxxxxxxxx             1/1     Running
user-deployment-xxxxxxxxxx             1/1     Running
product-deployment-xxxxxxxxxx          1/1     Running
Step 9 – Inspect the Probes

Verify that Kubernetes has registered the probes:

kubectl describe pod <product-pod-name>

Look for:

Readiness: http-get http://:3002/health
Liveness:  http-get http://:3002/health

This confirms the probes are active.

Step 10 – Test the Health Endpoint Through Ingress

If Ingress is configured, test:

http://localhost:8080/product/health

Expected response:

{
    "status": "UP",
    "service": "Product Service"
}

Similarly:

http://localhost:8080/auth/health

and

http://localhost:8080/user/health
Step 11 – Simulate a Failure (Optional)

To observe the liveness probe in action:

Modify the /health endpoint to return:
res.status(500).send("Service Down");
Rebuild and deploy the service.
Watch the Pods:
kubectl get pods -w

After several failed health checks, Kubernetes will restart the container automatically.

Restore the endpoint to return 200 OK after testing.

Useful Commands

Check Pods:

kubectl get pods

Describe a Pod:

kubectl describe pod <pod-name>

View logs:

kubectl logs <pod-name>

Watch Pods:

kubectl get pods -w

Restart a Deployment:

kubectl rollout restart deployment product-deployment

Check rollout status:

kubectl rollout status deployment product-deployment
Common Issues We Encountered
1. Health Endpoint Returns 404

Cause

The /health route was not added to the application.

Solution

Implement the route and rebuild the Docker image.

2. Readiness Probe Fails Immediately

Cause

The application needs time to start or connect to MongoDB Atlas.

Solution

Increase:

initialDelaySeconds: 20

or more, depending on startup time.

3. Pod Continuously Restarts

Cause

The liveness probe is receiving non-200 responses.

Solution

Verify:

/health returns HTTP 200.
The correct port is configured.
The application has started successfully.
Database connectivity is not blocking startup.
4. Health Endpoint Works Locally but Fails in Kubernetes

Cause

The container image running in Kubernetes is outdated.

Solution

Rebuild the image, push it to Docker Hub, update the Deployment image, and redeploy.

Best Practices
Keep the /health endpoint lightweight.
Do not perform expensive database queries in the health endpoint.
Return 200 OK only when the application is truly healthy.
Use separate readiness and liveness probes.
Tune probe timings based on application startup time.
Verify probes using kubectl describe pod after every deployment.
Verify Before Moving On

Before continuing, ensure:

✅ All three services expose a /health endpoint.
✅ Readiness probes are configured.
✅ Liveness probes are configured.
✅ Pods remain in the Running state.
✅ Health endpoints return HTTP 200 OK.
✅ kubectl describe pod shows both probes.
✅ Kubernetes can automatically restart unhealthy containers.
Chapter Summary

In this chapter, we made our microservices more resilient by implementing health endpoints and configuring Kubernetes readiness and liveness probes. These probes ensure that traffic is routed only to healthy Pods and that failed containers are automatically restarted, improving the overall reliability of the application.

What's Next?

In Chapter 10 – Scaling, Horizontal Pod Autoscaler (HPA) & Rolling Updates, we'll learn how to scale our microservices horizontally, configure a Horizontal Pod Autoscaler (HPA), perform zero-downtime rolling updates, and safely roll back deployments when needed. This chapter will introduce key production concepts for handling increased traffic and deploying new application versions without service interruption.