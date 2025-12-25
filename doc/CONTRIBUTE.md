# Contributing to NMCNPM2025

We welcome contributions to the **NMCNPM2025** Driver Management Platform! This guide will help you set up your development environment and understand our workflow.

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Firebase Account** (for backend database)
- **Google Cloud Account** (for Maps API and OAuth)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/NMCNPM2025.git
    cd NMCNPM2025
    ```

2.  **Install Dependencies**
    We use a workspace structure. You can install all dependencies from the root or individual packages.
    ```bash
    # For the backend specifically
    cd server
    npm install
    ```

3.  **Environment Configuration**
    You must configure your environment variables for the server to run.
    1.  Copy `.env.example` to `.env` inside `server/`.
    2.  Fill in the required keys.
    > See [CONFIG.md](CONFIG.md) for a detailed list of required variables.

### Running the App

To start the backend server in development mode:
```bash
cd server
npm run dev
```
The server will start on `http://localhost:3000`.

## 🧪 Testing

We use **Jest** for unit testing. Before submitting a PR, ensure all tests pass.

```bash
cd server
npm test
```

## 🤝 Contribution Workflow

1.  **Fork** the repository.
2.  Create a **Feature Branch** (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a **Pull Request**.

## 📚 Documentation
- [Structure Guide](STRUCTURE.md): Understanding the folder layout.
- [API Endpoints](ENDPOINT.md): List of available API routes.
- [Configuration](CONFIG.md): Environment variable details.
- [Troubleshooting](TROUBLESHOOTING.md): Common setup issues.

## Other Resources
- [Google Maps API Guide](GOOGLEMAPAPI.md)
- [Authentication Flow](AUTHENTICATION.md)