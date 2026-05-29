# Production Deployment Guide - Allied Solutions OS

## Prerequisites
- AWS Account with appropriate permissions
- Terraform >= 1.0
- kubectl >= 1.28
- Helm >= 3.0
- Docker for image building

## Infrastructure Stack
- **Compute**: EKS (Kubernetes 1.28)
- **Database**: RDS Aurora PostgreSQL 15.3
- **Cache**: ElastiCache Redis 7.0
- **Graph DB**: Neo4j (EC2 instance)
- **Container Registry**: ECR
- **Monitoring**: CloudWatch, Prometheus, Grafana
- **Logging**: CloudWatch Logs, Loki

## Deployment Steps

### 1. Initialize Terraform
```bash
cd infrastructure/terraform
terraform init \
  -backend-config="bucket=allied-solutions-terraform-state" \
  -backend-config="key=prod/terraform.tfstate" \
  -backend-config="region=us-east-1"
```

### 2. Plan Infrastructure
```bash
terraform plan \
  -var="db_password=<SECURE_PASSWORD>" \
  -var="aws_region=us-east-1" \
  -var="environment=production" \
  -out=tfplan
```

### 3. Apply Infrastructure
```bash
terraform apply tfplan
```

### 4. Configure kubectl
```bash
aws eks update-kubeconfig \
  --region us-east-1 \
  --name allied-solutions-production
```

### 5. Deploy Kubernetes Resources
```bash
# Create namespace and secrets
kubectl apply -f infrastructure/kubernetes/api-deployment.yaml

# Verify deployment
kubectl get pods -n allied-solutions
kubectl get svc -n allied-solutions
```

### 6. Deploy with Helm
```bash
helm repo add allied https://charts.example.com
helm repo update

helm install allied-solutions ./infrastructure/helm-charts/allied \
  --namespace allied-solutions \
  --values ./infrastructure/helm-charts/values-prod.yaml
```

## Post-Deployment

### Health Checks
```bash
# Check API health
kubectl exec -it -n allied-solutions <pod-name> -- curl localhost:3000/health

# Check database
psql -h <RDS_ENDPOINT> -U postgres -c "SELECT version();"

# Check Redis
redis-cli -h <REDIS_ENDPOINT> ping

# Check Neo4j
curl http://<NEO4J_IP>:7474
```

### Monitoring Setup
```bash
# Deploy Prometheus
kubectl apply -f infrastructure/kubernetes/prometheus-deployment.yaml

# Deploy Grafana
kubectl apply -f infrastructure/kubernetes/grafana-deployment.yaml

# Get Grafana admin password
kubectl get secret -n allied-solutions grafana-admin -o jsonpath="{.data.password}" | base64 --decode
```

### Database Migrations
```bash
# Connect to RDS
psql -h <RDS_ENDPOINT> -U postgres -d alliedsolutions

# Run migrations
psql -h <RDS_ENDPOINT> -U postgres -d alliedsolutions < services/api/src/database/migrations/*.sql
```

## Scaling

### Manual Scaling
```bash
kubectl scale deployment api --replicas=5 -n allied-solutions
```

### Autoscaling Status
```bash
kubectl get hpa -n allied-solutions
kubectl describe hpa api-hpa -n allied-solutions
```

## Disaster Recovery

### Database Backup
```bash
# Manual backup
aws rds create-db-snapshot \
  --db-cluster-identifier allied-solutions-production-db \
  --db-cluster-snapshot-identifier backup-$(date +%Y%m%d)
```

### Database Restore
```bash
aws rds restore-db-cluster-from-snapshot \
  --db-cluster-identifier allied-solutions-restore \
  --snapshot-identifier backup-<DATE> \
  --engine aurora-postgresql
```

### Kubernetes Backup (Velero)
```bash
# Install Velero
velero install --provider aws --bucket <BACKUP_BUCKET>

# Create backup
velero backup create allied-backup-$(date +%Y%m%d)

# Restore backup
velero restore create --from-backup allied-backup-<DATE>
```

## Security Hardening

### Enable Pod Security Policies
```bash
kubectl apply -f infrastructure/kubernetes/pod-security-policy.yaml
```

### Enable Network Policies
```bash
kubectl apply -f infrastructure/kubernetes/network-policy.yaml
```

### Enable RBAC
```bash
kubectl apply -f infrastructure/kubernetes/rbac.yaml
```

## Monitoring & Logging

### View Logs
```bash
# Application logs
kubectl logs -f deployment/api -n allied-solutions

# Cluster logs
aws logs tail /aws/eks/allied-solutions-production/cluster --follow

# RDS logs
aws logs tail /aws/rds/instance/allied-solutions-production-db-1 --follow
```

### Metrics
```bash
# View metrics
kubectl top nodes
kubectl top pods -n allied-solutions
```

## Troubleshooting

### Pod not running
```bash
kubectl describe pod <pod-name> -n allied-solutions
kubectl logs <pod-name> -n allied-solutions
```

### Connection issues
```bash
# Test RDS connection
kubectl exec -it <pod-name> -n allied-solutions -- psql -h <RDS_ENDPOINT> -U postgres

# Test Redis connection
kubectl exec -it <pod-name> -n allied-solutions -- redis-cli -h <REDIS_ENDPOINT> ping
```

### High CPU/Memory
```bash
# Check resource usage
kubectl top pods -n allied-solutions --sort-by=cpu
kubectl top pods -n allied-solutions --sort-by=memory
```

## Cleanup

### Delete Kubernetes Resources
```bash
kubectl delete namespace allied-solutions
```

### Destroy Infrastructure
```bash
cd infrastructure/terraform
terraform destroy -var="db_password=<PASSWORD>" -auto-approve
```

## Performance Optimization

### Database Query Optimization
- Enable query caching in Redis
- Use connection pooling (pgBouncer)
- Optimize indexes as per ARCHITECTURE.md

### API Optimization
- Enable gzip compression
- Implement rate limiting
- Cache responses at CDN level
- Use lazy loading for relationships

### Kubernetes Optimization
- Right-size pod resources
- Use node affinity for workload distribution
- Implement pod disruption budgets
- Use spot instances for non-critical workloads

## Compliance & Audit

### Audit Logs
```bash
# View Kubernetes audit logs
aws logs tail /aws/eks/allied-solutions-production/audit --follow
```

### Compliance Checks
```bash
# Run compliance checks
kubectl apply -f infrastructure/kubernetes/compliance-check.yaml
```

### Data Privacy
- Encryption at rest (enabled)
- Encryption in transit (TLS)
- Audit trail (enabled)
- GDPR compliance (implemented)
