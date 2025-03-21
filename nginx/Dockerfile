# nginx/Dockerfile
FROM nginx:stable-alpine
COPY default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]

