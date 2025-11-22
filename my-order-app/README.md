#!/bin/bash

# Stop script on error
set -e

echo "🚀 Starting Project Setup..."

# 1. Create Root Directory
mkdir -p my-order-app
cd my-order-app

# ==========================================
# 2. BACKEND SETUP (Node.js + Express + Docker)
# ==========================================
echo "📦 Setting up Backend-API..."

# Create Directory Structure
mkdir -p backend-api/src/{config,controllers,middleware,models,routes,services,utils}

cd backend-api

# Initialize Node.js Project (Default Template)
npm init -y > /dev/null

# Install Production Dependencies
echo "⬇️  Installing Backend Dependencies..."
npm install express mongoose dotenv cors socket.io jsonwebtoken bcryptjs

# Install Development Dependencies
npm install --save-dev nodemon

# Create Entry Point Files
touch server.js .env
touch src/app.js

# Generate Dockerfile
echo "🐳 Generating Dockerfile..."
cat <<EOF > Dockerfile
# Use a lightweight Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the app source code
COPY . .

# Expose the API port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
EOF

# Generate docker-compose.yml
echo "🐳 Generating docker-compose.yml..."
cat <<EOF > docker-compose.yml
version: '3.8'
services:
  # The Node.js Backend
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGO_URI=mongodb://mongo:27017/driver_app
      - JWT_SECRET=development_secret_key
    depends_on:
      - mongo
    restart: always

  # The Database
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
EOF

# Create Placeholder MVC Files (Empty Templates)
touch src/config/db.js src/config/firebase.js
touch src/controllers/authController.js src/controllers/orderController.js src/controllers/userController.js
touch src/middleware/authMiddleware.js src/middleware/errorMiddleware.js
touch src/models/Driver.js src/models/Order.js src/models/User.js
touch src/routes/authRoutes.js src/routes/orderRoutes.js src/routes/index.js
touch src/services/mapService.js
touch src/utils/socketHandler.js

# Return to root
cd ..

# ==========================================
# 3. MOBILE SETUP (Kotlin Placeholder)
# ==========================================
echo "📱 Setting up Mobile Directory..."
mkdir -p driver-mobile-app

echo ""
echo "✅ Project Structure Created Successfully!"
echo "---------------------------------------------------------"
echo "NEXT STEPS:"
echo "1. Backend: cd my-order-app/backend-api && docker-compose up -d"
echo "2. Mobile: Open Android Studio -> New Project -> Select 'my-order-app/driver-mobile-app' as the location."
echo "---------------------------------------------------------"