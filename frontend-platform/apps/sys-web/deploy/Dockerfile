FROM nginx:1.27-alpine
COPY frontend-platform/apps/sys-web/dist/ /usr/share/nginx/html/apps/sys/
COPY frontend-platform/apps/sys-web/deploy/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
