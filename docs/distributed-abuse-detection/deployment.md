# Deployment Guide

## 🚀 Production Deployment

This guide provides comprehensive instructions for deploying the Distributed Abuse Detection System in production environments. The system is designed for cloud-native deployment using Kubernetes with enterprise-grade reliability, security, and scalability.

## 📋 Prerequisites

### Infrastructure Requirements
- **Kubernetes Cluster**: v1.24+ with minimum 12 nodes
- **Node Specifications**: 4 vCPU, 16GB RAM, 100GB SSD per node
- **Network**: High-bandwidth inter-node connectivity (10Gbps+)
- **Storage**: Persistent volumes with high IOPS (3000+ IOPS)

### Required Tools
```bash
# Install required CLI tools
kubectl version --client
helm version
terraform version
docker version
```

### Cloud Provider Setup
```bash
# AWS EKS Setup
eksctl create cluster \
  --name moderation-cluster \
  --version 1.24 \
  --region us-west-2 \
  --nodegroup-name workers \
  --node-type m5.xlarge \
  --nodes 12 \
  --nodes-min 6 \
  --nodes-max 50 \
  --managed

# Configure kubectl
aws eks update-kubeconfig --region us-west-2 --name moderation-cluster
```

## 🏗️ Infrastructure as Code

### Terraform Configuration
```hcl
# infrastructure/main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.16"
    }
  }
}

# EKS Cluster
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  
  cluster_name    = "moderation-cluster"
  cluster_version = "1.24"
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
  
  eks_managed_node_groups = {
    workers = {
      min_size     = 6
      max_size     = 50
      desired_size = 12
      
      instance_types = ["m5.xlarge"]
      capacity_type  = "ON_DEMAND"
      
      k8s_labels = {
        Environment = "production"
        Application = "moderation"
      }
    }
  }
  
  # Add-ons
  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
    aws-ebs-csi-driver = {
      most_recent = true
    }
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "moderation_db" {
  identifier = "moderation-db"
  
  engine         = "postgres"
  engine_version = "14.9"
  instance_class = "db.r5.2xlarge"
  
  allocated_storage     = 500
  max_allocated_storage = 2000
  storage_type         = "gp3"
  storage_encrypted    = true
  
  db_name  = "moderation"
  username = "moderator"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = false
  final_snapshot_identifier = "moderation-db-final-snapshot"
  
  tags = {
    Name        = "moderation-db"
    Environment = "production"
  }
}

# ElastiCache Redis Cluster
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "moderation-redis"
  description                = "Redis cluster for moderation system"
  
  port                       = 6379
  parameter_group_name       = "default.redis7"
  node_type                 = "cache.r6g.xlarge"
  num_cache_clusters        = 3
  
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  subnet_group_name = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  tags = {
    Name        = "moderation-redis"
    Environment = "production"
  }
}

# MSK Kafka Cluster
resource "aws_msk_cluster" "kafka" {
  cluster_name           = "moderation-kafka"
  kafka_version         = "2.8.1"
  number_of_broker_nodes = 6
  
  broker_node_group_info {
    instance_type   = "kafka.m5.2xlarge"
    ebs_volume_size = 500
    client_subnets  = module.vpc.private_subnets
    security_groups = [aws_security_group.msk.id]
  }
  
  encryption_info {
    encryption_at_rest_kms_key_id = aws_kms_key.msk.arn
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster    = true
    }
  }
  
  configuration_info {
    arn      = aws_msk_configuration.kafka.arn
    revision = aws_msk_configuration.kafka.latest_revision
  }
  
  logging_info {
    broker_logs {
      cloudwatch_logs {
        enabled   = true
        log_group = aws_cloudwatch_log_group.msk.name
      }
    }
  }
  
  tags = {
    Name        = "moderation-kafka"
    Environment = "production"
  }
}
```

### Deploy Infrastructure
```bash
# Initialize and deploy infrastructure
cd infrastructure/
terraform init
terraform plan -var-file="production.tfvars"
terraform apply -var-file="production.tfvars"

# Get outputs
terraform output eks_cluster_endpoint
terraform output rds_endpoint
terraform output redis_endpoint
terraform output msk_bootstrap_brokers
```

## 🔧 Kubernetes Deployment

### Namespace Setup
```yaml
# deploy/namespaces.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: moderation-system
  labels:
    name: moderation-system
    istio-injection: enabled
---
apiVersion: v1
kind: Namespace
metadata:
  name: monitoring
  labels:
    name: monitoring
---
apiVersion: v1
kind: Namespace
metadata:
  name: kafka
  labels:
    name: kafka
```

### ConfigMaps and Secrets
```yaml
# deploy/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: moderation-config
  namespace: moderation-system
data:
  KAFKA_BROKERS: "kafka-1:9092,kafka-2:9092,kafka-3:9092"
  REDIS_HOST: "redis-cluster.cache.amazonaws.com"
  REDIS_PORT: "6379"
  DB_HOST: "moderation-db.cluster-xyz.us-west-2.rds.amazonaws.com"
  DB_PORT: "5432"
  DB_NAME: "moderation"
  LOG_LEVEL: "info"
  METRICS_PORT: "9090"
  HEALTH_CHECK_PORT: "8080"
  
---
apiVersion: v1
kind: Secret
metadata:
  name: moderation-secrets
  namespace: moderation-system
type: Opaque
data:
  DB_PASSWORD: <base64-encoded-password>
  REDIS_PASSWORD: <base64-encoded-password>
  JWT_SECRET: <base64-encoded-jwt-secret>
  ENCRYPTION_KEY: <base64-encoded-encryption-key>
```

### API Gateway Deployment
```yaml
# deploy/api-gateway.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: moderation-system
  labels:
    app: api-gateway
    version: v1
spec:
  replicas: 6
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
        version: v1
    spec:
      containers:
      - name: api-gateway
        image: moderation/api-gateway:v1.2.0
        ports:
        - containerPort: 3000
          name: http
        - containerPort: 9090
          name: metrics
        - containerPort: 8080
          name: health
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3000"
        envFrom:
        - configMapRef:
            name: moderation-config
        - secretRef:
            name: moderation-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
        volumeMounts:
        - name: logs
          mountPath: /app/logs
      volumes:
      - name: logs
        emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: moderation-system
  labels:
    app: api-gateway
spec:
  ports:
  - port: 80
    targetPort: 3000
    name: http
  - port: 9090
    targetPort: 9090
    name: metrics
  selector:
    app: api-gateway
```

### Worker Deployments
```yaml
# deploy/text-worker.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: text-worker
  namespace: moderation-system
  labels:
    app: text-worker
    version: v1
spec:
  replicas: 12
  selector:
    matchLabels:
      app: text-worker
  template:
    metadata:
      labels:
        app: text-worker
        version: v1
    spec:
      containers:
      - name: text-worker
        image: moderation/text-worker:v1.2.0
        env:
        - name: WORKER_TYPE
          value: "text"
        - name: CONSUMER_GROUP
          value: "text-processors"
        - name: BATCH_SIZE
          value: "32"
        - name: MAX_WAIT_TIME
          value: "50"
        envFrom:
        - configMapRef:
            name: moderation-config
        - secretRef:
            name: moderation-secrets
        resources:
          requests:
            memory: "768Mi"
            cpu: "750m"
          limits:
            memory: "1.5Gi"
            cpu: "1500m"
        volumeMounts:
        - name: model-storage
          mountPath: /app/models
        - name: logs
          mountPath: /app/logs
      volumes:
      - name: model-storage
        persistentVolumeClaim:
          claimName: model-storage-pvc
      - name: logs
        emptyDir: {}
---
# HPA for text workers
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: text-worker-hpa
  namespace: moderation-system
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: text-worker
  minReplicas: 3
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
```

### Image Worker Deployment
```yaml
# deploy/image-worker.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: image-worker
  namespace: moderation-system
  labels:
    app: image-worker
    version: v1
spec:
  replicas: 8
  selector:
    matchLabels:
      app: image-worker
  template:
    metadata:
      labels:
        app: image-worker
        version: v1
    spec:
      containers:
      - name: image-worker
        image: moderation/image-worker:v1.2.0
        env:
        - name: WORKER_TYPE
          value: "image"
        - name: CONSUMER_GROUP
          value: "image-processors"
        - name: BATCH_SIZE
          value: "16"
        - name: MAX_WAIT_TIME
          value: "100"
        envFrom:
        - configMapRef:
            name: moderation-config
        - secretRef:
            name: moderation-secrets
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        volumeMounts:
        - name: model-storage
          mountPath: /app/models
        - name: temp-storage
          mountPath: /tmp
      volumes:
      - name: model-storage
        persistentVolumeClaim:
          claimName: model-storage-pvc
      - name: temp-storage
        emptyDir:
          sizeLimit: 10Gi
```

## 📊 Monitoring Stack Deployment

### Prometheus Setup
```yaml
# deploy/monitoring/prometheus.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
    
    rule_files:
      - "rules/*.yml"
    
    scrape_configs:
    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
      - role: pod
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__
    
    - job_name: 'kafka'
      static_configs:
      - targets: ['kafka-exporter:9308']
    
    - job_name: 'postgres'
      static_configs:
      - targets: ['postgres-exporter:9187']
    
    - job_name: 'redis'
      static_configs:
      - targets: ['redis-exporter:9121']

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: monitoring
spec:
  replicas: 2
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      containers:
      - name: prometheus
        image: prom/prometheus:v2.40.0
        ports:
        - containerPort: 9090
        args:
        - '--config.file=/etc/prometheus/prometheus.yml'
        - '--storage.tsdb.path=/prometheus'
        - '--web.console.libraries=/etc/prometheus/console_libraries'
        - '--web.console.templates=/etc/prometheus/consoles'
        - '--storage.tsdb.retention.time=30d'
        - '--web.enable-lifecycle'
        - '--web.enable-admin-api'
        volumeMounts:
        - name: config
          mountPath: /etc/prometheus
        - name: storage
          mountPath: /prometheus
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
      volumes:
      - name: config
        configMap:
          name: prometheus-config
      - name: storage
        persistentVolumeClaim:
          claimName: prometheus-storage
```

### Grafana Setup
```yaml
# deploy/monitoring/grafana.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: grafana
  namespace: monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: grafana
  template:
    metadata:
      labels:
        app: grafana
    spec:
      containers:
      - name: grafana
        image: grafana/grafana:9.3.0
        ports:
        - containerPort: 3000
        env:
        - name: GF_SECURITY_ADMIN_PASSWORD
          valueFrom:
            secretKeyRef:
              name: grafana-secrets
              key: admin-password
        - name: GF_INSTALL_PLUGINS
          value: "grafana-piechart-panel,grafana-worldmap-panel"
        volumeMounts:
        - name: storage
          mountPath: /var/lib/grafana
        - name: dashboards
          mountPath: /etc/grafana/provisioning/dashboards
        - name: datasources
          mountPath: /etc/grafana/provisioning/datasources
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
      volumes:
      - name: storage
        persistentVolumeClaim:
          claimName: grafana-storage
      - name: dashboards
        configMap:
          name: grafana-dashboards
      - name: datasources
        configMap:
          name: grafana-datasources
```

## 🔐 Security Configuration

### Network Policies
```yaml
# deploy/security/network-policies.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: moderation-network-policy
  namespace: moderation-system
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: istio-system
    - namespaceSelector:
        matchLabels:
          name: monitoring
  - from:
    - podSelector:
        matchLabels:
          app: api-gateway
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to: []
    ports:
    - protocol: TCP
      port: 5432  # PostgreSQL
    - protocol: TCP
      port: 6379  # Redis
    - protocol: TCP
      port: 9092  # Kafka
    - protocol: TCP
      port: 53    # DNS
    - protocol: UDP
      port: 53    # DNS
```

### Pod Security Standards
```yaml
# deploy/security/pod-security.yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod-template
  namespace: moderation-system
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    runAsGroup: 1000
    fsGroup: 1000
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: app
    image: moderation/app:latest
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
    resources:
      limits:
        memory: "1Gi"
        cpu: "1000m"
      requests:
        memory: "512Mi"
        cpu: "500m"
```

## 🚀 Deployment Automation

### Helm Chart Structure
```
helm/
├── Chart.yaml
├── values.yaml
├── values-production.yaml
├── templates/
│   ├── api-gateway/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── hpa.yaml
│   ├── workers/
│   │   ├── text-worker.yaml
│   │   ├── image-worker.yaml
│   │   └── audio-worker.yaml
│   ├── monitoring/
│   │   ├── prometheus.yaml
│   │   ├── grafana.yaml
│   │   └── alertmanager.yaml
│   └── security/
│       ├── network-policies.yaml
│       └── pod-security-policies.yaml
└── charts/
    ├── kafka/
    ├── redis/
    └── postgresql/
```

### Production Values
```yaml
# helm/values-production.yaml
global:
  environment: production
  imageRegistry: "your-registry.com"
  imageTag: "v1.2.0"

apiGateway:
  replicaCount: 6
  image:
    repository: moderation/api-gateway
    tag: v1.2.0
  resources:
    requests:
      memory: 512Mi
      cpu: 500m
    limits:
      memory: 1Gi
      cpu: 1000m
  autoscaling:
    enabled: true
    minReplicas: 3
    maxReplicas: 20
    targetCPUUtilization: 70

textWorker:
  replicaCount: 12
  image:
    repository: moderation/text-worker
    tag: v1.2.0
  resources:
    requests:
      memory: 768Mi
      cpu: 750m
    limits:
      memory: 1.5Gi
      cpu: 1500m
  autoscaling:
    enabled: true
    minReplicas: 3
    maxReplicas: 50
    targetCPUUtilization: 70

imageWorker:
  replicaCount: 8
  image:
    repository: moderation/image-worker
    tag: v1.2.0
  resources:
    requests:
      memory: 2Gi
      cpu: 1000m
    limits:
      memory: 4Gi
      cpu: 2000m
  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 20
    targetCPUUtilization: 75

monitoring:
  prometheus:
    enabled: true
    retention: 30d
    storage: 100Gi
  grafana:
    enabled: true
    adminPassword: "secure-password"
  alertmanager:
    enabled: true

security:
  networkPolicies:
    enabled: true
  podSecurityStandards:
    enabled: true
  serviceAccount:
    create: true
    annotations:
      eks.amazonaws.com/role-arn: "arn:aws:iam::123456789:role/moderation-service-role"
```

### Deployment Script
```bash
#!/bin/bash
# deploy/deploy.sh

set -e

NAMESPACE="moderation-system"
HELM_RELEASE="moderation"
VALUES_FILE="values-production.yaml"

echo "🚀 Starting deployment to production..."

# Create namespace
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Add Helm repositories
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Deploy dependencies
echo "📦 Deploying dependencies..."
helm upgrade --install kafka bitnami/kafka \
  --namespace $NAMESPACE \
  --set replicaCount=6 \
  --set persistence.size=500Gi \
  --wait

helm upgrade --install redis bitnami/redis \
  --namespace $NAMESPACE \
  --set cluster.enabled=true \
  --set cluster.slaveCount=2 \
  --wait

# Deploy monitoring stack
echo "📊 Deploying monitoring stack..."
helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --wait

# Deploy main application
echo "🔧 Deploying moderation system..."
helm upgrade --install $HELM_RELEASE ./helm \
  --namespace $NAMESPACE \
  --values helm/$VALUES_FILE \
  --wait \
  --timeout 10m

# Verify deployment
echo "✅ Verifying deployment..."
kubectl get pods -n $NAMESPACE
kubectl get services -n $NAMESPACE
kubectl get hpa -n $NAMESPACE

# Run health checks
echo "🏥 Running health checks..."
kubectl wait --for=condition=ready pod -l app=api-gateway -n $NAMESPACE --timeout=300s
kubectl wait --for=condition=ready pod -l app=text-worker -n $NAMESPACE --timeout=300s
kubectl wait --for=condition=ready pod -l app=image-worker -n $NAMESPACE --timeout=300s

echo "🎉 Deployment completed successfully!"
echo "📊 Grafana dashboard: http://$(kubectl get svc grafana -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')"
echo "🔍 Prometheus: http://$(kubectl get svc prometheus -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')"
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches:
      - main
    tags:
      - 'v*'

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:ci
    
    - name: Run security scan
      run: npm audit --audit-level high

  build:
    needs: test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [api-gateway, text-worker, image-worker, audio-worker]
    steps:
    - uses: actions/checkout@v3
    
    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-${{ matrix.service }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=semver,pattern={{version}}
          type=semver,pattern={{major}}.{{minor}}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        file: ./docker/${{ matrix.service }}/Dockerfile
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-west-2
    
    - name: Update kubeconfig
      run: |
        aws eks update-kubeconfig --name moderation-cluster --region us-west-2
    
    - name: Deploy to Kubernetes
      run: |
        helm upgrade --install moderation ./helm \
          --namespace moderation-system \
          --values helm/values-production.yaml \
          --set global.imageTag=${{ github.sha }} \
          --wait \
          --timeout 10m
    
    - name: Verify deployment
      run: |
        kubectl rollout status deployment/api-gateway -n moderation-system
        kubectl rollout status deployment/text-worker -n moderation-system
        kubectl rollout status deployment/image-worker -n moderation-system
```

## 📝 Post-Deployment Checklist

### Verification Steps
```bash
# 1. Check all pods are running
kubectl get pods -n moderation-system

# 2. Verify services are accessible
kubectl get services -n moderation-system

# 3. Check HPA status
kubectl get hpa -n moderation-system

# 4. Test API endpoints
curl -X POST http://api-gateway/api/v1/moderate \
  -H "Content-Type: application/json" \
  -d '{"contentType": "text", "content": "test message"}'

# 5. Check monitoring dashboards
kubectl port-forward svc/grafana 3000:80 -n monitoring

# 6. Verify Kafka topics
kubectl exec -it kafka-0 -n moderation-system -- kafka-topics.sh --list --bootstrap-server localhost:9092

# 7. Check database connectivity
kubectl exec -it postgres-0 -n moderation-system -- psql -U moderator -d moderation -c "\dt"

# 8. Verify Redis cluster
kubectl exec -it redis-0 -n moderation-system -- redis-cli cluster info
```

### Performance Validation
```bash
# Load testing
k6 run --vus 1000 --duration 5m performance-test.js

# Monitor metrics during load test
kubectl top pods -n moderation-system
kubectl get hpa -n moderation-system --watch
```

This deployment guide ensures a production-ready system with enterprise-grade reliability, security, and observability. 