# Docker Setup Guide

This guide will walk you through the process of setting up Docker on your system. Docker is a platform that allows you to automate the deployment, scaling, and management of applications using containerization.

## Table of Contents

- [Docker Setup Guide](#docker-setup-guide)
  - [Table of Contents](#table-of-contents)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Installation](#2-installation)
    - [Windows](#windows)
    - [macOS](#macos)
    - [Linux (Ubuntu/Debian)](#linux-ubuntudebian)
  - [3. Verifying Installation](#3-verifying-installation)
  - [4. Basic Docker Commands](#4-basic-docker-commands)
  - [5. Running Your First Container](#5-running-your-first-container)
  - [7. Docker Compose (Optional)](#7-docker-compose-optional)
  - [8. Troubleshooting](#8-troubleshooting)

## 1. Prerequisites

Before you begin, ensure your system meets the following requirements:

*   **Operating System:** Windows 10 64-bit: Pro, Enterprise, or Education (Build 15063 or later). For Windows Home, you'll need to enable WSL 2.
*   **Operating System:** macOS 10.15 or newer.
*   **Operating System:** A supported Linux distribution (e.g., Ubuntu, Debian, Fedora, CentOS).
*   **Hardware Virtualization:** Enabled in your BIOS/UEFI settings (usually Intel VT-x or AMD-V). This is crucial for Docker Desktop on Windows and macOS.

## 2. Installation

Choose your operating system and follow the instructions below.

### Windows

1.  **Download Docker Desktop:** Go to the official Docker Desktop download page: [https://docs.docker.com/desktop/install/windows-install/](https://docs.docker.com/desktop/install/windows-install/)
2.  **Run the Installer:** Double-click the downloaded `Docker Desktop Installer.exe` file.
3.  **Follow Installation Wizard:**
    *   Ensure "Install required Windows components for WSL 2" is checked (recommended).
    *   Follow the on-screen prompts to complete the installation.
4.  **Restart Your Computer:** A restart is often required after installation.
5.  **Start Docker Desktop:** Once restarted, search for "Docker Desktop" in your Windows search bar and open it. It might take a few moments to start for the first time.

### macOS

1.  **Download Docker Desktop:** Go to the official Docker Desktop download page: [https://docs.docker.com/desktop/install/mac-install/](https://docs.docker.com/desktop/install/mac-install/)
2.  **Install Docker Desktop:**
    *   Double-click the `Docker.dmg` file.
    *   Drag the Docker icon to the Applications folder.
3.  **Open Docker Desktop:** Open Docker Desktop from your Applications folder. It will ask for permissions and might take a few moments to start.

### Linux (Ubuntu/Debian)

For other Linux distributions, please refer to the official Docker documentation.

1.  **Uninstall old versions (if any):**
    ```bash
    sudo apt-get remove docker docker-engine docker.io containerd runc
    ```
2.  **Update the `apt` package index and install packages to allow `apt` to use a repository over HTTPS:**
    ```bash
    sudo apt-get update
    sudo apt-get install \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    ```
3.  **Add Docker's official GPG key:**
    ```bash
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    ```
4.  **Set up the stable repository:**
    ```bash
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    ```
5.  **Install Docker Engine:**
    ```bash
    sudo apt-get update
    sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo service docker start
    sudo usermod -aG docker $USER
    newgrp docker
    ```

## 3. Verifying Installation

After installation, verify that Docker is running correctly by opening a terminal or command prompt and running the following command:

```bash
docker run hello-world
```

This command downloads a test image and runs it in a container. If successful, it will print an informational message and exit.

## 4. Basic Docker Commands

Here are some fundamental Docker commands you'll use frequently:

*   **`docker --version`**: Display the Docker version.
*   **`docker ps`**: List running containers. Add `-a` to see all containers (running and stopped).
*   **`docker images`**: List Docker images on your system.
*   **`docker pull <image_name>`**: Download a Docker image from Docker Hub.
*   **`docker run <image_name>`**: Run a container from an image.
*   **`docker stop <container_id_or_name>`**: Stop a running container.
*   **`docker rm <container_id_or_name>`**: Remove a stopped container.
*   **`docker rmi <image_id_or_name>`**: Remove a Docker image.
*   **`docker exec -it <container_id_or_name> <command>`**: Execute a command inside a running container.

## 5. Running Your First Container

Let's run a simple Nginx web server in a Docker container:

1.  **Pull the Nginx image:**
    ```bash
    docker pull nginx
    ```
2.  **Run the Nginx container:**
    ```bash
    docker run -d -p 80:80 --name my-nginx nginx
    ```
    *   `-d`: Runs the container in detached mode (in the background).
    *   `-p 80:80`: Maps port 80 on your host to port 80 in the container.
    *   `--name my-nginx`: Assigns a name to your container.
3.  **Verify Nginx is running:** Open your web browser and navigate to `http://localhost`. You should see the Nginx welcome page.
4.  **Stop and remove the container:**
    docker stop my-nginx
    docker rm my-nginx
```

## 6. Building Your Own Image

You can create your own Docker images using a `Dockerfile`. A `Dockerfile` is a text document that contains all the commands a user could call on the command line to assemble an image.

Here's a simple example of a `Dockerfile` for a Node.js application:

```dockerfile
# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "start"]
```

**Steps to build and run your own image:**

1.  **Create a `Dockerfile`** in the root of your project directory (e.g., `server/Dockerfile` for your backend).
2.  **Build the image:**
    ```bash
    docker build -t my-node-app:1.0 .
    ```
    *   `-t my-node-app:1.0`: Tags the image with a name and version.
    *   `.`: Specifies the build context (the current directory).
3.  **Run a container from your image:**
    ```bash
    docker run -p 3000:3000 --name my-running-app my-node-app:1.0
    docker stop my-running-app
    docker rm my-running-app
    ```

## 7. Docker Compose (Optional)

Docker Compose is a tool for defining and running multi-container Docker applications. With Compose, you use a YAML file to configure your application's services. Then, with a single command, you create and start all the services from your configuration.

Here's a simple `docker-compose.yml` example for a Node.js application with a PostgreSQL database:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgres://user:password@db:5432/mydatabase
    depends_on:
      - db
    volumes:
      - .:/app
      - /app/node_modules

  db:
    image: postgres:13
    environment:
      POSTGRES_DB: mydatabase
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

**Steps to use Docker Compose:**

1.  **Create a `docker-compose.yml` file** in the root of your project.
2.  **Start your application:**
    ```bash
    docker-compose up -d
    ```
    *   `-d`: Runs the services in detached mode.
3.  **Stop your application:**
    ```bash
    docker-compose down
    ```

## 8. Troubleshooting

*   **"Cannot connect to the Docker daemon"**:
    *   Ensure Docker Desktop (Windows/macOS) is running.
    *   On Linux, check if the Docker service is active (`sudo systemctl status docker`) and if your user is in the `docker` group (`newgrp docker`).
*   **Port conflicts**: If you get an error about a port already being in use, it means another application or container is using that port. You can either stop the conflicting application or change the port mapping in your `docker run` command or `docker-compose.yml`.
*   **Image pull failures**: Check your internet connection. If you're behind a proxy, configure Docker to use it.
*   **WSL 2 issues on Windows**: Ensure WSL 2 is properly installed and set as the default for Docker Desktop. You might need to update your WSL kernel.
    ```bash
    wsl --update
    wsl --set-default-version 2
    ```
*   **Permissions issues on Linux**: If you encounter permission errors when running Docker commands, ensure your user is added to the `docker` group:
    ```bash
    sudo usermod -aG docker $USER
    newgrp docker
    sudo systemctl restart docker
    