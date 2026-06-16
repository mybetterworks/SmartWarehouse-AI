FROM nginx:1.27-alpine
COPY frontend-platform/apps/portal-shell/dist/ /usr/share/nginx/html/
COPY frontend-platform/apps/portal-shell/deploy/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
