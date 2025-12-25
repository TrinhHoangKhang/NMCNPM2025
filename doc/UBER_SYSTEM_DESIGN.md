# Uber System Design Summary

Based on the video: [Uber System Design Interview Question](https://youtu.be/DGtalg5efCw)

## 1. Requirements

### Functional
- **Rider**: Request a ride, see nearby drivers, see ETA/Fare, track driver.
- **Driver**: Accept/Decline rides, update location, see rider location.
- **System**: Match rider to driver, handle payments, track trips.

### Non-Functional
- **Scalability**: Handle millions of users/drivers.
- **High Availability**: System must always be up.
- **Low Latency**: Matching and tracking must be near real-time (< 1s).

## 2. Core Architecture Components

- **Rider/Driver Services**: Manage user profiles and auth.
- **Location Service**: Receives real-time updates from drivers.
- **Matching Service**: Pairs riders with drivers based on proximity and ETA.
- **Trip Service**: Manages the lifecycle of a ride.
- **Payment Service**: Handles transactions.
- **Notification Service**: Sends push updates to users.

## 3. Key Technical Strategies

### Geospatial Indexing
- **Problem**: Finding the closest drivers efficiently among millions.
- **Solution**: Use grid-based solutions like **QuadTrees**, **Geohashing**, or **S2/H3 Cells**. 
- **Implementation**: Divide the map into cells. Only search for drivers in the same or neighboring cells.

### Distance Matrix & ETA
- **Problem**: "As the crow flies" distance is inaccurate.
- **Solution**: Use **Google Maps Distance Matrix** or **GraphHopper** to calculate real-world travel time (ETA) through the road network.

### Real-time Communication
- **WebSockets**: Used for bidirectional, low-latency communication (tracking).
- **Polling (Short/Long)**: Fallback or for less critical updates.

## 4. Scalability & Reliability
- **Database Sharding**: Shard by location (Geo-sharding) to keep searches local.
- **Consistency**: Distributed locks or strong consistency for the "Matching" phase to prevent double-booking.
