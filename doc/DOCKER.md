## How to Run Docker

This guide will walk you through the basic steps of running Docker on your system.

### 1. Install Docker

First, you need to install Docker Desktop (for Windows or macOS) or Docker Engine (for Linux).

*   **Windows/macOS:** Download and install Docker Desktop from the official Docker website: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
*   **Linux:** Follow the installation instructions specific to your Linux distribution on the Docker documentation website: [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)

### 2. Verify Docker Installation

After installation, open your terminal or command prompt and run the following command to verify that Docker is installed correctly:

```bash
docker --version
```

You should see output similar to this, indicating the Docker version:

```
Docker version 24.0.5, build 24.0.5-0ubuntu1~22.04.1
```

You can also run a simple test container to ensure everything is working:

```bash
docker run hello-world
```

This command downloads a test image and runs a container that prints a "Hello from Docker!" message.

### 3. Basic Docker Commands

Here are some fundamental Docker commands you'll use frequently:

*   **`docker pull <image_name>`**: Downloads an image from Docker Hub.
    ```bash
    docker pull ubuntu
    ```
*   **`docker run <image_name>`**: Creates and starts a new container from an image.
    ```bash
    docker run -it ubuntu bash
    ```
    *   `-i`: Keeps STDIN open even if not attached.
    *   `-t`: Allocates a pseudo-TTY.
    *   `bash`: Runs the bash shell inside the container.
*   **`docker ps`**: Lists all running containers.
    ```bash
    docker ps
    ```
*   **`docker ps -a`**: Lists all containers (running and stopped).
    ```bash
    docker ps -a
    ```
*   **`docker stop <container_id_or_name>`**: Stops a running container.
    