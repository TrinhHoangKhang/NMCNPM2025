# Use a lightweight Node.js image
FROM node:25-alpine3.21

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of our application code
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# The command to run the application
CMD [ "npm", "start" ]