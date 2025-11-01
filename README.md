# NMCNPM2025
Đồ án Nhập môn công nghệ phần mềm lớp CQ2023-31 

## Documentation
- [Contributing Guide](doc/CONTRIBUTE.md)
- [Environment Setup](doc/ENV.md)
- [Configuration](doc/CONFIG.md)
- [Package and Library Inclusion Guide](doc/PACKAGE.md)
- [How to Run Docker](doc/DOCKER.md)
- [Server](doc/SERVER.md)
- [Client](doc/CLIENT.md)
- [Mobile](doc/MOBILE.md)

## Project Description
This is a mobile app about ordering a Driver and Rider, built with React Native for the mobile client and Node.js with Express for the backend server. It includes features like user authentication, real-time communication, and location-based services for ride-hailing.

## Technologies Used
### Authentication (OAuth 2.0)

- **Passport.js**: Flexible authentication middleware for Node.js, supporting OAuth 2.0 strategies (Google, Facebook, etc.).
- **OAuth 2.0 Providers**: Integration with third-party authentication services like Google, Facebook, or GitHub for streamlined user login.

### Backend (Server)

- **Node.js**: JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
- **MongoDB**: NoSQL document database.
- **Mongoose**: MongoDB object data modeling (ODM) for Node.js.
- **JWT (JSON Web Tokens)**: For secure user authentication.
- **Bcrypt**: For hashing passwords.
- **CORS**: Middleware to enable Cross-Origin Resource Sharing.

### Frontend (Client - Web)

- **React**: A JavaScript library for building user interfaces.
- **React Router**: For declarative routing in React applications.
- **Axios**: Promise-based HTTP client for the browser and Node.js.
- **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.

### Mobile (Client - React Native)

- **React Native**: A framework for building native mobile apps using React.
- **Expo**: A framework and platform for universal React applications.
- **Firebase**: For real-time database, authentication, and other mobile backend services.
- **React Navigation**: For navigation in React Native applications.
- **Redux (or Context API)**: For state management.
- **React Native Maps**: For displaying maps and location-based services.
