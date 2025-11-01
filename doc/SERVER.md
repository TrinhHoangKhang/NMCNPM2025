# SERVER

## 1. Mô tả

Tài liệu này mô tả kiến trúc, công nghệ và cách triển khai của máy chủ (server) trong dự án NMCNPM2025. Máy chủ chịu trách nhiệm xử lý các yêu cầu từ client, quản lý dữ liệu và cung cấp các API cho ứng dụng.

## 2. Kiến trúc

Kiến trúc máy chủ được thiết kế theo mô hình Client-Server, với các thành phần chính sau:

- **API Gateway:** Điểm truy cập duy nhất cho tất cả các yêu cầu từ client. Nó chịu trách nhiệm định tuyến yêu cầu đến các dịch vụ phù định, xác thực và ủy quyền.
- **Microservices:** Hệ thống được chia thành nhiều dịch vụ nhỏ, độc lập, mỗi dịch vụ chịu trách nhiệm cho một chức năng cụ thể. Điều này giúp tăng tính linh hoạt, khả năng mở rộng và dễ bảo trì.
- **Database:** Cơ sở dữ liệu lưu trữ tất cả dữ liệu của ứng dụng.
- **Caching:** Cơ chế lưu trữ tạm thời dữ liệu thường xuyên được truy cập để giảm tải cho database và tăng tốc độ phản hồi.
- **Message Queue:** Hàng đợi tin nhắn được sử dụng để giao tiếp không đồng bộ giữa các microservices, giúp tăng tính ổn định và khả năng chịu lỗi.

## 3. Công nghệ

Các công nghệ được sử dụng để xây dựng máy chủ bao gồm:

- **Ngôn ngữ lập trình:** Node.js (với TypeScript)
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Caching:** Redis
- **Message Queue:** RabbitMQ
- **API Gateway:** Ocelot (hoặc tự xây dựng với Express.js)
- **Containerization:** Docker
- **Orchestration:** Kubernetes (cho môi trường sản phẩm)

## 4. Cấu trúc thư mục

Cấu trúc thư mục của dự án server sẽ được tổ chức như sau:
server/
├── src/
│   ├── controllers/
│   │   ├── authController.ts
│   │   └── userController.ts
│   ├── models/
│   │   ├── userModel.ts
│   │   └── productModel.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   └── userRoutes.ts
│   ├── services/
│   │   ├── authService.ts
│   │   └── userService.ts
│   ├── middlewares/
│   │   ├── authMiddleware.ts
│   │   └── errorMiddleware.ts
│   ├── utils/
│   │   ├── helpers.ts
│   │   └── logger.ts
│   ├── app.ts
│   └── server.ts
├── config/
│   ├── default.json
│   └── production.json
├── tests/
│   ├── unit/
│   │   └── auth.test.ts
│   └── integration/
│       └── users.test.ts
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
## 5. Triển khai

### 5.1. Môi trường phát triển

Để thiết lập môi trường phát triển cho server, làm theo các bước sau:

1.  **Cài đặt Node.js và npm:** Đảm bảo bạn đã cài đặt Node.js (phiên bản 18 trở lên) và npm (hoặc yarn).
    ```bash
    node -v
    npm -v
    ```
2.  **Clone repository:**
    ```bash
    git clone <URL_REPOSITORY_SERVER>
    cd server
    ```
3.  **Cài đặt dependencies:**
    ```bash
    npm install
    # hoặc
    yarn install
    ```
4.  **Tạo file `.env`:** Tạo một file `.env` trong thư mục gốc của dự án server dựa trên `.env.example` và điền các thông tin cấu hình cần thiết (ví dụ: thông tin database, JWT secret).
    ```
    # .env
    PORT=3000
    DATABASE_URL=postgresql://user:password@host:port/database
    JWT_SECRET=your_jwt_secret_key
    REDIS_URL=redis://localhost:6379
    RABBITMQ_URL=amqp://localhost
    ```
5.  **Chạy database và caching (Docker):** Sử dụng Docker Compose để khởi động PostgreSQL và Redis.
    ```bash
    docker-compose up -d postgres redis rabbitmq
    ```
6.  **Chạy ứng dụng:**
    ```bash
    npm run dev
    # hoặc
    yarn dev
    ```
    Server sẽ khởi động và lắng nghe tại cổng được cấu hình trong `.env` (mặc định là 3000).

### 5.2. Môi trường sản phẩm

Để triển khai server trong môi trường sản phẩm, chúng tôi sẽ sử dụng Docker và Kubernetes.

1.  **Build Docker image:**
    ```bash
    docker build -t nmcnpm2025-server .
    ```
2.  **Push Docker image lên registry:**
    