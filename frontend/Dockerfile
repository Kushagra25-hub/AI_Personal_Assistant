# Multi-stage Dockerfile for React Frontend
# Stage 1: Build static assets
FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
# Replace backend URL with production URL or reverse-proxy path
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Stage 2: Serve with lightweight NGINX
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Custom Nginx configuration for Single Page Application (SPA) routing
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

