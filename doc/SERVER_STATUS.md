# Server Status Report

This document lists the current features, known issues, and test coverage for the Backend Server (`my-server`).

## 1. Features

### Authentication & Security
-   **Google OAuth2**: Secure login flow redirecting to Google and handling callbacks (`/auth/google`).
-   **JWT Generation**: Issues JSON Web Tokens upon successful login for mobile app authentication.
-   **Session Management**: Uses `express-session` for intermediate state handling.

### Driver Management
-   **Profile Retrieval**: Get full driver details including vehicle info (`GET /api/drivers/:id`).
-   **Status Control**: Drivers can toggle `ONLINE`/`OFFLINE` (`PATCH /api/drivers/:id/status`).
    -   *Logic*: Prevents going `ONLINE` without a registered vehicle.
-   **Real-time Location**: Update driver's GPS coordinates (`PATCH /api/drivers/:id/location`).
-   **Profile Updates**: Modify driver information (`PATCH /api/drivers/:id`).

### Google Maps Integration
-   **Route Calculation**: Server-side calculation of distance and duration between two points (`POST /api/maps/calculate-route`).
    -   *Security*: Hides the `GOOGLE_MAPS_API_KEY` from the client.
    -   *Tech*: Uses Google Distance Matrix API.

### Trip Management
-   **Booking Flow**: Full lifecycle support: `REQUESTED` -> `ACCEPTED` -> `IN_PROGRESS` -> `COMPLETED`.
-   **Fare Calculation**: Automated pricing logic based on distance and duration fetched from Google Maps.
-   **Driver Assignment**: Drivers can accept specific trips (`PATCH /api/trips/:id/accept`).

### User (Rider) Management
-   **Profile Access**: Retrieve user profile data (`GET /api/users/:id`).
-   **Profile Updates**: Modify user details like name or phone (`PATCH /api/users/:id`).

## 2. Unit Tests

The project uses **Jest** and **Supertest**. Run via `npm test`.

| Test Suite | Description | Status |
| :--- | :--- | :--- |
| `tests/app.test.js` | Verifies server startup and health check endpoint (`GET /`). | ✅ Passing |
| `tests/user.test.js` | Tests user profile retrieval and updates. | ✅ Passing |
| `tests/driver.test.js` | Tests driver retrieval and status updates. Mocks Firebase interactions to isolate logic. | ✅ Passing |
| `tests/maps.test.js` | Tests route calculation. Mocks Google Maps API calls. | ✅ Passing |
| `tests/trip.test.js` | Tests booking flow and fare calculation. | ✅ Passing |

## 3. Known Issues & Limitations

### Features
-   **Chat System**: The Chat API (`/api/chat/send`) is currently a **placeholder**. It returns `501 Not Implemented`.

### Configuration
-   **Firebase Private Key**: The `.env` file requires strictly formatted private keys. Newline characters (`\n`) in the key string must be handled carefully (see `TROUBLESHOOTING.md`).

### Testing
-   **Database Mocking**: Tests do not connect to a real Firebase Emulator. They test logic assuming the database works as expected. Integration tests with the Emulator should be added in the future.
