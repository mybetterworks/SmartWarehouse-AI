# SmartWarehouse Home Server k3s Deployment

This directory contains the Kubernetes baseline for the home Ubuntu server deployment.

## Runtime Contract

- Namespace: `smartwarehouse`
- Public entry: `edge-nginx` NodePort `30080`
- Release tag in manifests: `v0.1.0`
- ACR pull secret: `acr-pull-secret`
- Runtime secret: `smartwarehouse-runtime-secret`
- SQL ConfigMap: `mysql-init-sql`, generated from `deploy/mysql/init-sys-db.sql`

## Sensitive Data Rules

Do not write real ACR usernames, ACR passwords, JWT secrets, database passwords, private keys, or DDNS tokens into this directory.

Create secrets manually or generate them on the Ubuntu server:

```bash
kubectl -n smartwarehouse create secret docker-registry acr-pull-secret \
  --docker-server=registry.cn-hangzhou.aliyuncs.com \
  --docker-username="<ACR_USERNAME>" \
  --docker-password="<ACR_PASSWORD>" \
  --docker-email="placeholder@example.com"
```

## Apply Order

```bash
export KUBECONFIG="$HOME/.kube/config"

kubectl apply -f deploy/k8s/home-server/00-namespace.yaml
kubectl apply -f deploy/k8s/home-server/10-storage.yaml
kubectl apply -f deploy/k8s/home-server/20-middleware.yaml

kubectl -n smartwarehouse create configmap mysql-init-sql \
  --from-file=init-sys-db.sql=deploy/mysql/init-sys-db.sql \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl -n smartwarehouse delete job mysql-init-smart-sys --ignore-not-found=true
kubectl apply -f deploy/k8s/home-server/50-mysql-init-job.yaml
kubectl -n smartwarehouse wait --for=condition=complete job/mysql-init-smart-sys --timeout=600s

kubectl apply -f deploy/k8s/home-server/30-apps.yaml
kubectl apply -f deploy/k8s/home-server/40-edge-nginx.yaml
```

## Verify

```bash
kubectl -n smartwarehouse get pods -o wide
kubectl -n smartwarehouse get svc edge-nginx
curl -f http://<UBUNTU_LAN_IP>:30080/
curl -f http://<UBUNTU_LAN_IP>:30080/apps/sys/assets/remoteEntry.js
curl -f "http://<UBUNTU_LAN_IP>:30080/api/sys/auth/risk-state?username=admin"
```
