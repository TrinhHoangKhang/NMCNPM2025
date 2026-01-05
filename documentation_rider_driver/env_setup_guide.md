# Environment Variable Setup Guide

This guide explains how to configure the environment variables for the project using the provided templates.

## 1. Locate the Template
The project uses `.env.example` files as templates to show which configuration keys are required.
- **Server**: [my-server/.env.example](file:///home/test-linux-ubuntu/Documents/Code/Git/NMCNPM2025/my-server/.env.example)

## 2. Create the `.env` File
To set up your local environment, you need to create a copy of the template.

### Using Terminal (Linux/macOS)
Navigate to the directory and run:
```bash
cp .env.example .env
```

### Using File Explorer
1. Right-click `.env.example`.
2. Select **Copy** and then **Paste**.
3. Rename the copy to exactly `.env`.

## 3. Update Configuration Values
Open the newly created `.env` file and replace the placeholder values with your actual configuration.

### Critical Sections:
- **Server Configuration**: Set the `PORT` and `NODE_ENV`.
- **Firebase**: Provide your Firebase Project ID, Client Email, and Private Key.
- **Security**: Change the `SESSION_SECRET` and `ADMIN_BYPASS_TOKEN` to secure, random strings.
- **External APIs**: Add your keys for Google Maps, Gemini AI, or GraphHopper if needed.
- **Infrastructure**: Update the `REDIS_URL` if your Redis instance is not running on the default local port.

## 4. Important Security Note
> [!WARNING]
> Never commit your `.env` file to version control. It contains sensitive secrets like API keys and private keys. The project is already configured to ignore `.env` files via `.gitignore`.
