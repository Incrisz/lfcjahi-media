FROM docker.io/library/nginx:1.27-alpine

# Serve the static site files with Nginx.
WORKDIR /usr/share/nginx/html
COPY . .
RUN chmod +x /usr/share/nginx/html/docker-entrypoint.sh

EXPOSE 80

CMD ["/usr/share/nginx/html/docker-entrypoint.sh"]
