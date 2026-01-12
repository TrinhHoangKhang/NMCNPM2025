# Ride Order Flow

This document summarizes the lifecycle of a ride request in the system.

## 1. CREATED
- **Action**: Rider submits a ride request (pickup/dropoff, vehicle type).
- **System**: Validates input, calculates fare, creates a Trip record with status `CREATED`.

## 2. SEARCHING
- **Action**: System initiates driver search.
- **System**: Updates Trip status to `SEARCHING`. Performs geospatial query to find available online drivers within 5km.
- **Note**: If no drivers are found, the request remains pending or times out (client polling/socket).

## 3. OFFERED
- **Action**: A specific driver is identified/pinged.
- **System**: Updates Trip status to `OFFERED`.
- **Note**: In the current simplified flow, `SEARCHING` often transitions directly to `ACCEPTED` when a driver accepts, but `OFFERED` represents the state where a driver sees the request.

## 4. ACCEPTED
- **Action**: Driver accepts the ride request.
- **System**: 
    - Updates Trip status to `ACCEPTED`.
    - Assigns Driver to Trip.
    - Sets Driver status to `busy`.
    - Notifies Rider via Socket.io.

## 5. ARRIVING
- **Action**: Driver is driving toward the pickup point.
- **System**: Updates Trip status to `ARRIVING`.

## 6. IN_PROGRESS
- **Action**: Passenger is picked up, ride starts.
- **System**: Updates Trip status to `IN_PROGRESS`.

## 7. COMPLETED
- **Action**: Ride reaches destination.
- **System**:
    - Updates Trip status to `COMPLETED`.
    - Sets `paymentStatus` to `pending`.
    - Frees up Driver (status becomes `available`).

## Alternate: CANCELLED
- **Action**: Rider or Driver cancels the trip.
- **System**:
    - Updates Trip status to `CANCELLED`.
    - Records cancellation reason.
    - **Cancellation Fee**: If cancelled after `ACCEPTED`, `ARRIVING`, or `IN_PROGRESS`, a fee is calculated and applied.
    - Frees up Driver if one was assigned.
