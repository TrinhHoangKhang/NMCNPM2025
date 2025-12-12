# syntax=docker/dockerfile:1
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
