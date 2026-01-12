# Server Setup & Running Guide

This guide provides step-by-step instructions to get the backend server up and running on your local machine.

## Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Required for Redis)
- Git

## Step 1: Install Dependencies
Open a terminal in the `my-server` directory and run:
```bash
npm install
```

## Step 2: Environment Configuration
1. **Create the .env file**
   Copy the example file to create your local configuration:
   ```bash
   cp .env.example .env
   # On Windows Command Prompt: copy .env.example .env
   ```

2. **Configure API Keys**
   Open `.env` and fill in the missing values.

   - **FIREBASE_API_KEY**:
     1. Go to [Firebase Console](https://console.firebase.google.com/).
     2. Settings (Gear icon) > Project Settings.
     3. Copy the **Web API Key**.

   - **FIREBASE_CREDENTIALS (Private Key)**:
     1. In Firebase Console > Project Settings > Service accounts.
     2. Click **Generate new private key**.
     3. Open the downloaded JSON file.
     4. Copy values to `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` (ensure the private key is wrapped in double quotes).

   - **GOOGLE_CLIENT_ID** (for OAuth):
     1. Go to [Google Cloud Console](https://console.cloud.google.com/).
     2. APIs & Services > Credentials.
     3. Create/Select an "OAuth 2.0 Client ID" > Web Application.
     4. Copy the **Client ID**.

   - **GROQ_API_KEY** (for AI):
     1. Sign up at [Groq Console](https://console.groq.com/).
     2. Create and copy an API Key.

   - **GOOGLE_MAPS_API_KEY** (Optional):
     1. From Google Cloud Console > Credentials.
     2. Create an API Key restricted to Maps capabilities.

## Step 3: Start Redis
The server uses Redis for real-time presence features. The easiest way to run it is via Docker.

Run this command in the `my-server` directory (where `docker-compose.yml` is located):
```bash
docker-compose up -d redis
```
*Note: This starts Redis in the background on port 6379.*

## Step 4: Run the Server
Now you can start the backend server.

**For Development (Auto-restart on save):**
```bash
npm run dev
```

**For Production-like run:**
```bash
npm start
```

## Verification
- **Server URL**: http://localhost:3000
- **Health Check**: Visit `http://localhost:3000/` in your browser. You should see "RideApp Server is Running!".

## Troubleshooting
- **Port 3000 in use?**
  Change `PORT=3001` in your `.env` file.
- **Redis Connection Error?**
  Ensure Docker is running and you executed Step 3.
