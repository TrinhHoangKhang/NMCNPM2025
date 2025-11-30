# Endpoint for api, call from mobile

- `/api`
- `/api/auth`: Get authorization
- `/api/users/:id`
- `/api`
- `/api`
- `/api/messages/...`





## Dashboard
- `GET /dashboard` - Get dashboard overview

## Users
- `GET /users` - List all users
- `POST /users` - Create new user
- `GET /users/:id` - Get user details
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## Drivers
- `GET /drivers` - List all drivers
- `POST /drivers` - Create new driver
- `GET /drivers/:id` - Get driver details
- `PUT /drivers/:id` - Update driver
- `DELETE /drivers/:id` - Delete driver
- `GET /drivers/:id/trips` - Get driver's trips
- `PATCH /drivers/:id/status` - Update driver status (active/inactive)

## Trips/Routes
- `GET /trips` - List all trips
- `POST /trips` - Create new trip
- `GET /trips/:id` - Get trip details
- `PUT /trips/:id` - Update trip
- `DELETE /trips/:id` - Delete trip
- `PATCH /trips/:id/status` - Update trip status

## Vehicles
- `GET /vehicles` - List all vehicles
- `POST /vehicles` - Create new vehicle
- `GET /vehicles/:id` - Get vehicle details
- `PUT /vehicles/:id` - Update vehicle
- `DELETE /vehicles/:id` - Delete vehicle
- `PATCH /vehicles/:id/assign` - Assign vehicle to driver

## Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/register` - User registration