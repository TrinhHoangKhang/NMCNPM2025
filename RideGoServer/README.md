🚖 RideApp Backend API
This is the backend server for the RideApp Driver Management System. It handles User Authentication (OAuth), Driver Management, Geospatial logic (Google Maps), and AI Chatbot integration.

Built with Node.js, Express, Firebase (Firestore), and Docker.

📋 Prerequisites
Before you begin, ensure you have the following installed on your machine:

Node.js (v18 or higher) - Download

Docker Desktop (Optional, for containerization) - Download

Git - Download

🚀 Getting Started
1. Clone the Repository
Bash

git clone https://github.com/YOUR_USERNAME/ride-app-backend.git
cd ride-app-backend
2. Install Dependencies
Bash

npm install
3. Environment Configuration (Crucial Step)
The project relies on API keys that are not stored in Git. You must create a .env file in the root directory.

Copy the example file:

Bash

cp .env.example .env
(On Windows, just copy and rename .env.example to .env manually)

Open .env and fill in the secrets. Ask the Team Lead for these values.

Ini, TOML

# Server
PORT=3000
NODE_ENV=development

# Secrets
SESSION_SECRET=ask-team-lead
JWT_SECRET=ask-team-lead

# Google OAuth & Maps
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_MAPS_KEY=...

# OpenAI
OPENAI_API_KEY=...

# Firebase (Note: Wrap Private Key in double quotes "")
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
🏃‍♂️ How to Run
You can run the server in two ways: Locally (for quick coding) or via Docker (for a clean environment).

Method A: Local Development (Recommended for coding)
This uses nodemon to restart the server automatically when you save a file.

Bash

npm run dev
Server runs at: http://localhost:3000

Method B: Docker (Recommended for testing/production)
This mimics the production environment exactly.

Bash

# Build and Run
docker-compose up --build

# To stop: Press Ctrl+C
# To remove containers: docker-compose down
📂 Project Structure (MVC+S)
We use the Model-View-Controller-Service architecture to separate concerns.

Plaintext

src/
├── config/         # Database & API configurations (Firebase, Passport)
├── controllers/    # Request handlers (Traffic Cops) - No logic here!
├── models/         # Data wrappers & Validators (User, Driver)
├── routes/         # API Endpoint definitions
├── services/       # Business Logic & External API calls (Maps, OpenAI)
├── middleware/     # Auth checks & Error handling
└── app.js          # Entry point
📡 API Endpoints
Authentication
GET /auth/google - Starts Google OAuth flow.

GET /auth/google/callback - Handle return from Google.

Chatbot
POST /api/chat/send

Body: { "message": "How do I register?" }

Response: { "reply": "To register, upload your license..." }

Maps & Routing
POST /api/maps/calculate

Body: { "start": "New York", "end": "Boston" }

Response: { "distance": "346 km", "duration": "3 hours 45 mins" }

🛠 Troubleshooting
1. Firebase Private Key Error? If you see an error about the private key format:

Ensure the key in .env is wrapped in double quotes "".

Ensure src/config/firebaseConfig.js includes .replace(/\\n/g, '\n').

2. Port 3000 already in use?

Kill the process running on port 3000.

OR change PORT=3000 to PORT=3001 in your .env file.

3. "Driver not found" in Docker?

Docker needs to be rebuilt if you add new dependencies. Run docker-compose up --build.

👥 Contributors
[Your Name] - Backend Lead

[Team Member Name] - Frontend Dev