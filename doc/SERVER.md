## Server Folder Structure

This document outlines the purpose of each folder within the server directory.

### `api/`
*   **`controllers/`**: This folder contains the business logic for handling incoming requests. Each file in this directory typically corresponds to a specific resource or set of related functionalities (e.g., `userController.js`, `productController.js`). These controllers interact with services and models to process data and prepare responses.

*   **`models/`**: This folder defines the data structures and interactions with the database. Each file represents a database model (e.g., `User.js`, `Product.js`), often using an ORM (Object-Relational Mapper) like Mongoose for MongoDB or Sequelize for SQL databases. These models define the schema, relationships, and methods for querying and manipulating data.

*   **`routes/`**: This folder defines the API endpoints and maps them to the appropriate controller functions. Each file typically groups related routes (e.g., `userRoutes.js`, `productRoutes.js`). These files use a routing library (like Express's `Router`) to define HTTP methods (GET, POST, PUT, DELETE) and their corresponding handlers.

### Other
*   **`services/`**: This folder encapsulates reusable business logic that can be shared across multiple controllers. Services often handle complex operations, data transformations, or interactions with external APIs. This separation helps keep controllers lean and focused on request handling, while services manage the core business rules.

*   **`middleware/`**: This folder contains functions that execute before or after route handlers. Middleware can be used for various purposes, such as authentication, authorization, logging, error handling, or data validation. Examples include `authMiddleware.js` for verifying user tokens or `errorHandler.js` for centralized error management.

*   **`config/`**: This folder stores configuration files for the server, such as database connection strings, API keys, port numbers, and other environment-specific settings. It's common to use environment variables (e.g., `.env` files) and a library like `dotenv` to manage these configurations securely.

*   **`utils/`**: This folder contains utility functions and helper modules that are not directly related to business logic but are useful across the application. Examples include functions for data validation, encryption, date formatting, or custom error classes.

### Tests
*   **`tests/`**: This folder contains unit, integration, and end-to-end tests for the server-side application. This helps ensure the quality and correctness of the codebase.
