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
