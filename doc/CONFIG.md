# Configuration

This project uses environment variables for configuration. Copy `.env.example` to `.env` in the `my-server` directory.

## Backend (`my-server/.env`)

| Variable | Description | Required | Source |
| :--- | :--- | :--- | :--- |
| `PORT` | Server port | No (default 3000) | Application |
| `NODE_ENV` | Environment (dev, test, production) | No | Application |
| `SESSION_SECRET` | Secret for session signing | **Yes** | Generated string |
| `JWT_SECRET` | Secret for JWT signing | **Yes** | Generated string |
| `GOOGLE_CLIENT_ID` | OAuth2 Client ID | **Yes** | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth2 Client Secret | **Yes** | Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | OAuth2 Callback URL | **Yes** | `http://localhost:3000/auth/google/callback` |
| `GOOGLE_MAPS_API_KEY` | API Key for Maps SDK | **Yes** | Google Cloud Console |
| `FIREBASE_PROJECT_ID` | Firebase Project ID | **Yes** | Firebase Console |
| `FIREBASE_CLIENT_EMAIL` | Service Account Email | **Yes** | Firebase Console (Service Accounts) |
| `FIREBASE_PRIVATE_KEY` | Service Account Private Key | **Yes** | Firebase Console (Service Accounts) |

> [!IMPORTANT]
> The `FIREBASE_PRIVATE_KEY` must handle newlines correctly. If typing directly in `.env`, ensure it is in quotes or properly formatted.