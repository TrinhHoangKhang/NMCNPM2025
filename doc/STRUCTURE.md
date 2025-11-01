# Client Folder Structure

This document outlines the proposed folder structure for the `client` directory.

## Root Directory

- `Dockerfile`: Configuration for building the client's Docker image.
- `nginx.conf`: Nginx configuration for serving the client application.
- `package.json`: Project dependencies and scripts.
- `public/`: Contains the main HTML file and other static assets.
  - `index.html`: The main HTML file for the React application.
- `src/`: Contains the source code of the React application.

## `src` Directory Structure

A well-organized `src` directory is crucial for scalability and maintainability.

- `index.js`: The entry point of the React application.
- `App.js`: The main application component.
- `App.css`: Main application styles.

### Proposed `src` Subdirectories

- **`api/`**: To handle all API calls to the backend.
  - `client.js`: Axios or fetch client setup.
  - `userApi.js`: API calls related to users.
  - `productApi.js`: API calls related to products.

- **`assets/`**: For static assets like images, fonts, and icons.
  - `images/`
  - `fonts/`
  - `icons/`

- **`components/`**: For reusable UI components.
  - `common/`: For very generic and reusable components (e.g., Button, Input, Modal).
    - `Button.js`
    - `Input.js`
  - `layout/`: For layout components like Header, Footer, Sidebar.
    - `Header.js`
    - `Footer.js`
  - `product/`: Components related to products (e.g., ProductCard, ProductList).
    - `ProductCard.js`
    - `ProductList.js`

- **`contexts/`**: For React Context API providers.
  - `AuthContext.js`
  - `ThemeContext.js`

- **`hooks/`**: For custom React hooks.
  - `useAuth.js`
  - `useFetch.js`

- **`pages/`**: For top-level route components (views).
  - `HomePage.js`
  - `LoginPage.js`
  - `ProductDetailsPage.js`
  - `ProfilePage.js`

- **`styles/`**: For global styles, variables, and mixins.
  - `_variables.scss`
  - `_mixins.scss`
  - `global.scss`

- **`utils/`**: For utility functions.
  - `date.js`
  - `validators.js`

This structure promotes separation of concerns and makes it easier to navigate the codebase as it grows.

## Server Folder Structure

This document outlines the folder structure for the `server` directory, which is a Node.js application (likely using Express.js).

### Root Directory

- `Dockerfile`: Configuration for building the server's Docker image.
- `package.json`: Project dependencies and scripts.
- `src/`: Contains the source code of the server application.
- `tests/`: Contains tests for the application.

### `src` Directory Structure

- `index.js`: The main entry point of the application.
- **`api/`**: Defines the API layer, including routes, controllers, and models.
    - `controllers/`: Handles the request/response logic.
        - `product.controller.js`
        - `user.controller.js`
    - `models/`: Defines the database schemas.
        - `product.model.js`
        - `user.model.js`
    - `routes/`: Defines the API routes.
        - `product.route.js`
        - `user.route.js`
- **`config/`**: Contains configuration files.
    - `database.js`: Database connection configuration.
    - `index.js`: Main configuration file.
    - `logger.js`: Logger configuration.
- **`middlewares/`**: Custom middleware for Express.
    - `auth.middleware.js`: Authentication middleware.
    - `errorHandler.middleware.js`: Error handling middleware.
    - `logger.middleware.js`: Logging middleware.
    - `validate.middleware.js`: Request validation middleware.
- **`services/`**: Contains the business logic of the application.
    - `auth.service.js`
    - `email.service.js`
    - `order.service.js`
    - `payment.service.js`
    - `product.service.js`
    - `user.service.js`
- **`utils/`**: Utility functions.
    - `apiError.js`: Custom error class.
    - `asyncHandler.js`: Wrapper for async route handlers.
    - `dateFormatter.js`
    - `emailValidator.js`
    - `validators.js`

### `tests` Directory Structure

- **`api/`**: Tests for the API layer.
    - `controllers/`
        - `user.controller.test.js`
    - `routes/`
        - `user.routes.test.js`
- **`services/`**: Tests for the business logic.
    - `user.service.test.js`
- **`utils/`**: Tests for utility functions.
    - `validators.test.js`

## Mobile Folder Structure

This document outlines the proposed folder structure for the `mobile` directory, which is a React Native application.

### Root Directory

- `App.js`: The main entry point of the application.

### Proposed `src` Directory Structure

- **`src/`**: This directory will contain the majority of the application's source code.
    - **`api/`**: To handle all API calls to the backend.
        - `client.js`: Axios or fetch client setup.
        - `userApi.js`: API calls related to users.
        - `productApi.js`: API calls related to products.
    - **`assets/`**: For static assets like images, fonts, and icons.
        - `images/`
        - `fonts/`
    - **`components/`**: For reusable UI components.
        - `common/`: For very generic and reusable components (e.g., Button, Input, Card).
        - `product/`: Components related to products.
    - **`navigation/`**: To define the navigation structure of the app.
        - `AppNavigator.js`: The main navigator.
        - `AuthNavigator.js`: The navigator for the authentication flow.
    - **`screens/`**: For screen components.
        - `HomeScreen.js`
        - `LoginScreen.js`
        - `ProductDetailsScreen.js`
        - `ProfileScreen.js`
    - **`styles/`**: For global styles and theme information.
        - `colors.js`
        - `typography.js`
        - `theme.js`
    - **`utils/`**: For utility functions.
        - `date.js`
        - `validators.js`