# Bookshop Management System

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
