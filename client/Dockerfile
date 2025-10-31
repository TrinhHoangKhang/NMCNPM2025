# STAGE 1: Build the React app
FROM node:25-alpine3.21 AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# STAGE 2: Serve the built app with Nginx
FROM nginx:alpine

# Copy the static files from the build stage
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (Nginx default)
EXPOSE 80

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]