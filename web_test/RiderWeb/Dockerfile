# Stage 1: Build
FROM node:18-alpine as build
WORKDIR /app

# Declare build argument
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copy package files (from context root/RiderWeb due to new context)
# Since context is root, we copy from RiderWeb/
COPY RiderWeb/package*.json ./
RUN npm install

# Copy source
COPY RiderWeb/ .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Copy shared nginx conf from root context
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
