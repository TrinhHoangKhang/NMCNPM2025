# Build stage
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# We keep this generic for dev/prod. For true production, we'd run npm run build and serve with Nginx.
# But for this environment, we'll optimize the dev setup.

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
