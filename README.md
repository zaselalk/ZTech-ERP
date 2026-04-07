# Scalable ERP built with Typescript

This is a simple bookshop management system with a React frontend and a Node.js backend.

## Getting Started

To get started, you'll need to have Node.js and npm installed.

1.  Install the dependencies for both the client and server:

    ```bash
    npm install
    ```

2.  Configure backend environment variables:

    - Copy `server/.env.example` to `server/.env` and set values:
      - `JWT_SECRET` (required)
      - `PORT` (default `5001`)
      - `CORS_ORIGIN` (e.g., `http://localhost:5173`)
      - `DB_*` (MySQL connection settings)

3.  Run the development servers:

    ```bash
    npm run dev
    ```

This will start the backend server on port 5001 and the frontend development server on port 5173.

### Backend Only

From `server/`:

```bash
npm run dev
```

Build and run (production):

```bash
npm run build
npm start
```

Build docker image in server

```
docker build -t bookshop-server -f .Dockerfile .
```

## Create a mysql container with shared network

### Create a network

```
docker network create pos-network
```

### Create a mysql container on same network

Tempory we expose the port to outside

```
docker run -d --name MySQL --network pos-network -v mysql-data:/var/lib/mysql -p 3306:3306 -e  MYSQL_ROOT_PASSWORD=password mysql:8

```

login to container and create database

```
docker exec -it <container_id> bash
```

### Run the container on same network

```
docker run --env-file .env -p 5000:5000 --network pos-network  bookshop-server
```

### restart application after env changes

```
docker stop yatadola-storyflix-api
docker rm yatadola-storyflix-api

docker run -d \
  --name yatadola-storyflix-api \
  --restart unless-stopped \
  -p 5000:5000 \
  --network pos-network \
  -v /home/asela/yatadola-storyflix-api/.env:/app/.env \
  -v /home/asela/yatadola-storyflix-api/backups:/app/backups \
  ghcr.io/zaselalk/storyflix-yatadola:latest
```

## Testing

This project has a comprehensive testing infrastructure. See [TEST_PLAN.md](TEST_PLAN.md) for the complete testing strategy.

### Running Tests

**Frontend Tests:**
```bash
cd client
npm run test              # Run all tests
npm run test:watch        # Run in watch mode
npm run test:coverage     # Run with coverage report
```

**Backend Tests:**
```bash
cd server
npm run test              # Run all tests
npm run test:watch        # Run in watch mode
npm run test:coverage     # Run with coverage report
npm run test:unit         # Run unit tests only
npm run test:integration  # Run integration tests only
```

### Test Coverage

- Frontend: Unit tests for components, services, and utilities
- Backend: Unit tests for routes, middleware, and models
- Integration: End-to-end workflow tests

For detailed information about testing strategy, test execution, and writing tests, see:
- [TEST_PLAN.md](TEST_PLAN.md) - Comprehensive test plan and strategy
- [server/test/README.md](server/test/README.md) - Backend testing guide
