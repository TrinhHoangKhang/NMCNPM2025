# Bt2 Backend API Documentation

This document provides a comprehensive guide to the API endpoints and Socket.io events for the Bt2 Backend server.

## Base URL
`http://localhost:3000` (or as configured in `.env`)

---

## Authentication
Most endpoints require authentication via a Firebase ID Token (JWT) sent in the `Authorization` header.

**Format:**
```http
Authorization: Bearer <token>
```

---

## 1. Authentication Endpoints (`/api/auth`)

### Register User
*   **Method:** `POST`
*   **URL:** `/api/auth/register`
*   **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "strongpassword",
      "name": "John Doe",
      "phone": "0123456789",
      "role": "RIDER | DRIVER | ADMIN",
      "vehicleType": "MOTORBIKE | 4 SEAT | 7 SEAT", // Mandatory if role is DRIVER
      "licensePlate": "29A-12345" // Mandatory if role is DRIVER
    }
    ```
*   **Response:** `201 Created`
    ```json
    {
      "success": true,
      "message": "User registered successfully",
      "user": { ... }
    }
    ```

### Login User
*   **Method:** `POST`
*   **URL:** `/api/auth/login`
*   **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "password"
    }
    ```
*   **Response:** `200 OK`
    ```json
    {
      "success": true,
      "message": "Login successful",
      "user": { "token": "...", ... }
    }
    ```

---

## 2. User Endpoints (`/api/users`)
*Requires Authentication*

### Get All Users (Admin Only)
*   **Method:** `GET`
*   **URL:** `/api/users`
*   **Query Parameters:** `role`, `search`
*   **Response:** `200 OK`

### Get User Profile
*   **Method:** `GET`
*   **URL:** `/api/users/:id`
*   **Response:** `200 OK`

### Update User Profile
*   **Method:** `PATCH`
*   **URL:** `/api/users/:id`
*   **Request Body:** Partial User Object
*   **Response:** `200 OK`

---

## 3. Trip Endpoints (`/api/trips`)
*Requires Authentication*

### Request a Trip (Rider Only)
*   **Method:** `POST`
*   **URL:** `/api/trips/request`
*   **Request Body:**
    ```json
    {
      "pickupLocation": { "lat": 10.762622, "lng": 106.660172 },
      "dropoffLocation": { "lat": 10.773531, "lng": 106.704043 },
      "vehicleType": "MOTORBIKE | 4 SEAT | 7 SEAT",
      "paymentMethod": "CASH | WALLET"
    }
    ```
*   **Response:** `201 Created`

### Get Trip Estimate
*   **Method:** `POST`
*   **URL:** `/api/trips/estimate`
*   **Request Body:** Similar to request, but without `paymentMethod`.
*   **Response:** `200 OK`

### Get Current Trip
*   **Method:** `GET`
*   **URL:** `/api/trips/current`
*   **Response:** `200 OK` Returns the active trip for the user.

### Cancel Trip
*   **Method:** `PATCH`
*   **URL:** `/api/trips/cancel`
*   **Request Body:** `{ "tripId": "..." }` (Optional if current trip exists)
*   **Response:** `200 OK`

### Driver: Get Available Trips
*   **Method:** `GET`
*   **URL:** `/api/trips/available`
*   **Response:** `200 OK` Returns requested trips matching driver's vehicle type.

### Driver: Accept Trip
*   **Method:** `PATCH`
*   **URL:** `/api/trips/:id/accept`

### Driver: Mark Pickup
*   **Method:** `PATCH`
*   **URL:** `/api/trips/:id/pickup`

### Driver: Mark Complete
*   **Method:** `PATCH`
*   **URL:** `/api/trips/:id/complete`
*   **Request Body:** `{ "cashCollected": true }` (Required if CASH)

### Rate Trip
*   **Method:** `POST`
*   **URL:** `/api/trips/:id/rate`
*   **Request Body:**
    ```json
    {
      "driverRating": 5,
      "tripRating": 5,
      "comment": "Great ride!"
    }
    ```

---

## 4. Driver Endpoints (`/api/drivers`)
*Requires Authentication*

### Get Driver Stats
*   **Method:** `GET`
*   **URL:** `/api/drivers/stats`

### Update Driver Status
*   **Method:** `PATCH`
*   **URL:** `/api/drivers/status`
*   **Request Body:** `{ "status": "ONLINE | OFFLINE" }`

---

## 5. Socket.io Events

### Client to Server
- `heartbeat`: Maintains online status.
- `update_location`: `{ tripId, lat, lng, heading }` - Driver sends location during trip.
- `switch_vehicle`: `vehicleType` - Driver switches active vehicle.

### Server to Client
- `new_ride_request`: Sent to drivers when a trip is requested.
- `trip_accepted`: Sent to rider when a driver accepts.
- `driver_location`: Broadcasted to rider during a trip.
- `trip_no_driver`: Sent to rider if no driver is found after 60s.
- `trip_completed`: Sent to both parties on trip completion.
- `trip_cancelled`: Sent to the other party when a trip is cancelled.

---

## 6. AI Endpoints (`/api/ai`)
*Requires Authentication*

### Get Command Instruction
*   **Method:** `POST`
*   **URL:** `/api/ai/command`
*   **Request Body:** `{ "text": "Take me to the airport" }`
*   **Response:** `200 OK` Returns structured instructions for the mobile app.

### Query Trip History
*   **Method:** `POST`
*   **URL:** `/api/ai/query`
*   **Request Body:** `{ "query": "How many trips did I take last week?" }`
*   **Response:** `200 OK` Returns natural language answer based on history.

---

## 7. Chat Endpoints (`/api/chat`)
*Requires Authentication*

### Send Message
*   **Method:** `POST`
*   **URL:** `/api/chat/send`
*   **Request Body:** `{ "receiverId": "...", "message": "Hello!" }`
*   **Response:** `200 OK`

### Get Chat History
*   **Method:** `GET`
*   **URL:** `/api/chat/history/:friendId`
*   **Response:** `200 OK`

---

## 8. Map Endpoints (`/api/maps`)

### Calculate Route
*   **Method:** `POST`
*   **URL:** `/api/maps/calculate-route`
*   **Request Body:** `{ "origin": "...", "destination": "..." }`
*   **Response:** `200 OK`

---

## 9. Payment Endpoints (`/api/payments`)
*Requires Authentication*

### Generate Payment QR (Rider)
*   **Method:** `GET`
*   **URL:** `/api/payments/:id/pay`
*   **Description:** Generates a QR code for WALLET payment.

### Confirm Payment (Driver)
*   **Method:** `POST`
*   **URL:** `/api/payments/:id/pay_confirm`
*   **Description:** Driver confirms receipt of payment.

---

## 10. Ranking Endpoints (`/api/ranks`)

### Get Leaderboard
*   **Method:** `GET`
*   **URL:** `/api/ranks`
*   **Response:** `200 OK` Returns driver rankings.

---

## 11. Friend Endpoints (`/api/friends`)
*Requires Authentication*

### Send Friend Request
*   **Method:** `POST`
*   **URL:** `/api/friends/request`
*   **Request Body:** `{ "receiverId": "..." }`

### Get Pending Requests
*   **Method:** `GET`
*   **URL:** `/api/friends/requests`

### Respond to Request
*   **Method:** `PUT`
*   **URL:** `/api/friends/requests/:id`
*   **Request Body:** `{ "status": "ACCEPTED | REJECTED" }`

### Get Friends List
*   **Method:** `GET`
*   **URL:** `/api/friends`
