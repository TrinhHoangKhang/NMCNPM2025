# Build stage
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Final stage
FROM node:22-alpine

WORKDIR /app

# Copy from build stage
COPY --from=build /app /app

EXPOSE 3000

# Set environment variable
ENV NODE_ENV=production

CMD ["npm", "start"]