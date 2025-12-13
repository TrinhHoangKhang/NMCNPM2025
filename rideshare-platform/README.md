# Rideshare Platform

## Docker Setup

### Prerequisites
- Docker
- Docker Compose

### Development Environment
The development environment enables **hot-reloading** for both the server and the client applications. Any changes you make to the source code will be immediately reflected in the running containers.

**Start Development:**
```bash
docker-compose up --build
```
*Note: You might need `sudo` depending on your Docker installation.*

**Accessing Services:**
- **Rider App**: http://localhost:5173
- **Driver App**: http://localhost:5174
- **Admin Dashboard**: http://localhost:5175
- **Backend API**: http://localhost:5000

### Production Environment
The production environment builds optimized static assets for the client applications and serves them using **Nginx**. The server runs in production mode.

**Start Production:**
```bash
docker-compose -f docker-compose.prod.yml up --build
```

**Accessing Services:**
The ports remain the same for consistency, but they are now served by Nginx:
- **Rider App**: http://localhost:5173
- **Driver App**: http://localhost:5174
- **Admin Dashboard**: http://localhost:5175
