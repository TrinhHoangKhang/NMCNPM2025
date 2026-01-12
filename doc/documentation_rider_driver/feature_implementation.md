# Feature Implementation Guide

This document explains how the core features of the Ride-Hailing system are implemented across the stack.

## 1. Ride Request Flow

The ride request is a multi-step process involving both REST APIs and WebSockets for real-time updates.

### Step 1: Trip Estimation
Before a rider confirms a ride, the application calls the estimation endpoint.
- **Endpoint**: `POST /api/trips/estimate`
- **Logic**: The server calculates the distance and duration (using Google Maps API) and applies a fare formula based on the `vehicleType`.

### Step 2: Creating a Request
When the rider clicks "Confirm", a trip request is created.
- **Endpoint**: `POST /api/trips/request`
- **Logic**: 
    1. Validates user input and active trip status.
    2. Creates a Trip record with status `REQUESTED`.
    3. **Socket Broadcast**: The server emits a `new_ride_request` event to a specific room (e.g., `drivers_MOTORBIKE`).
    4. **Timeout**: A 60-second timer starts. If no driver accepts, the status changes to `NO_DRIVER_FOUND` and the rider is notified via `trip_no_driver` socket event.

### Step 3: Driver Acceptance
Drivers see a list of available trips or receive real-time pings.
- **Endpoint**: `PATCH /api/trips/:id/accept`
- **Logic**:
    1. Checks if the trip is still available.
    2. Assigns the `driverId` and updates status to `ACCEPTED`.
    3. **Room Join**: Both Rider and Driver are added to a private Socket.io room: `trip_{tripId}`.
    4. **Notification**: Rider receives a `trip_accepted` event with driver details.

## 2. Real-time Communication (Socket.io)

Real-time interactions are handled by a dedicated Socket.io server.

### Key Events
| Event Name | Sender | Recipient | Description |
| :--- | :--- | :--- | :--- |
| `new_ride_request` | Server | Drivers | Sent when a new trip is requested in their area/type. |
| `trip_accepted` | Server | Rider | Sent when a driver accepts the request. |
| `trip_cancelled` | Server | Other Party | Sent if either party cancels the trip. |
| `trip_completed` | Server | Both | Sent when the driver marks the trip as finished. |
| `driver_location_update`| Driver | Rider | Continuous stream of driver's GPS coordinates. |

## 3. Map Integration

The system uses Google Maps API for several critical features:
- **Geocoding**: Converting addresses to lat/lng coordinates.
- **Directions API**: To draw the route on the map and calculate distance.
- **Places Autocomplete**: Helping users search for locations efficiently.

## 4. Authentication and Roles

Authentication is handled via Firebase Auth combined with custom JWT tokens.
- **Middleware**: `checkAuth` verifies the token.
- **Role-Based Access**: `checkRole(['DRIVER'])` ensures only approved drivers can access driver-specific endpoints like `/api/trips/available`.
