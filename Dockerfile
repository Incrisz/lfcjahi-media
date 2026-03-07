FROM docker.io/library/nginx:1.27-alpine

# Serve the static site files with Nginx.
WORKDIR /usr/share/nginx/html
COPY . .

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
