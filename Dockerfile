# ==========================================
# Stage 1: Build Phase
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install packages
RUN npm ci

# Copy full application codebase
COPY . .

# Build production bundle
RUN npm run build

# ==========================================
# Stage 2: Production Server Phase
# ==========================================
FROM nginx:alpine

# Copy built static assets from Stage 1 to Nginx default html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration if needed (handles routing fallbacks for SPAs)
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
