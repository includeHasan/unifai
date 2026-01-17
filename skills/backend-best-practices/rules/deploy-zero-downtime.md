---
title: Implement Zero-Downtime Deployments
impact: LOW-MEDIUM
impactDescription: Eliminates service interruption during deployments
tags: deployment, zero-downtime, continuous-deployment
---

## Implement Zero-Downtime Deployments

Use rolling deployments and health checks to deploy without downtime.

**Deployment strategies:**

```yaml
# Docker Compose - Rolling Update
version: '3'
services:
  api:
    image: myapp:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
      rollback_config:
        parallelism: 1
        delay: 5s
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

```yaml
# Kubernetes - Rolling Update
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
      - name: api
        image: myapp:latest
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 20
```

**Blue-Green Deployment:**

```bash
# Deploy new version (green)
docker-compose -f docker-compose.green.yml up -d

# Wait for health checks
sleep 30

# Switch traffic to green
nginx -s reload

# Stop old version (blue)
docker-compose -f docker-compose.blue.yml down
```

Reference: [Zero-Downtime Deployment](https://martinfowler.com/bliki/BlueGreenDeployment.html)
