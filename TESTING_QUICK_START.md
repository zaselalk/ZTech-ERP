# Testing Quick Start Guide

Complete guide to start implementing tests on the ZTech POS project.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- MySQL 8+ running locally (for backend tests)
- Git for version control

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
# Install all dependencies
npm install

# Or install individually
cd client && npm install
cd ../server && npm install
```

### 2. Configure Environment

**Frontend (.env):**

```bash
cd client
cp .env .env.local
# Edit VITE_API_URL if needed (default: http://localhost:5001/api)
```

**Backend (.env):**

```bash
cd server
cp .env.example .env
# Set these variables:
# JWT_SECRET=your_secret_key
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=ztech_erp_test (for testing)
# NODE_ENV=test (when running tests)
```

### 3. Verify Test Setup

```bash
# Frontend - Check Vitest is configured
cd client
npm run test:coverage

# Backend - Check Jest is configured
cd server
npm run test:coverage
```

## 📊 Coverage Requirements

**Current Phase (Milestones 1-2):**

- Minimum: 60% (all metrics)
- Target: 70%+ (critical paths)

**After Milestone 2:**

- Minimum: 65%

**After Milestone 4:**

- Minimum: 75%

**Final Target:**

- Minimum: 80%

## 📝 Writing Your First Test

### Backend Route Test Example

**File:** `server/routes/auth.test.ts`

```typescript
import request from "supertest";
import app from "../app";
import { initializeTestDatabase, closeTestDatabase } from "../test/helpers";

describe("Auth Routes", () => {
  beforeAll(async () => {
    await initializeTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "admin", password: "password" });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it("should reject invalid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "admin", password: "wrong" });

      expect(res.statusCode).toBe(401);
    });
  });
});
```

### Frontend Service Test Example

**File:** `client/src/services/authService.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import * as authService from "./authService";

// Mock the API client
vi.mock("../utils/api", () => ({
  default: {
    fetch: vi.fn(),
  },
}));

describe("authService", () => {
  beforeEach(() => {
    // Clear any stored tokens
    localStorage.clear();
  });

  it("should store token after login", async () => {
    const mockToken = "test-token-123";

    authService.storeToken(mockToken);

    expect(localStorage.getItem("auth_token")).toBe(mockToken);
  });

  it("should retrieve stored token", () => {
    const mockToken = "test-token-456";
    localStorage.setItem("auth_token", mockToken);

    const token = authService.getToken();

    expect(token).toBe(mockToken);
  });
});
```

### Component Test Example

**File:** `client/src/components/Sales.test.tsx`

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Sales from "./Sales";

// Mock the service
vi.mock("../services", () => ({
  salesService: {
    getSales: vi.fn(() => Promise.resolve([])),
    createSale: vi.fn(() => Promise.resolve({})),
  },
}));

describe("Sales Component", () => {
  it("should render sales list", async () => {
    render(<Sales />);

    const heading = screen.getByText(/sales/i);
    expect(heading).toBeInTheDocument();
  });

  it("should handle sale creation", async () => {
    render(<Sales />);

    const button = screen.getByRole("button", { name: /new sale/i });
    fireEvent.click(button);

    // Assert modal opens or form appears
    expect(screen.getByText(/create sale/i)).toBeInTheDocument();
  });
});
```

## 🏃 Running Tests

### Frontend Tests

```bash
cd client

# Run all tests once
npm run test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Backend Tests

```bash
cd server

# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage
```

### Both (from root)

```bash
# Run frontend and backend tests
npm run test
```

## 📍 Test File Organization

### Backend

```
server/
├── routes/
│   ├── auth.ts
│   ├── auth.test.ts          ← Test file same location
│   ├── sales.ts
│   └── sales.test.ts
├── middleware/
│   ├── requireAuth.ts
│   └── requireAuth.test.ts
├── db/
│   ├── models/
│   │   ├── user.ts
│   │   └── user.test.ts
│   └── ...
└── test/
    ├── setup.ts              ← Shared test setup
    ├── helpers/              ← Test utilities
    └── fixtures/             ← Test data
```

### Frontend

```
client/src/
├── services/
│   ├── authService.ts
│   ├── authService.test.ts   ← Test file same location
│   └── ...
├── components/
│   ├── Sales.tsx
│   ├── Sales.test.tsx        ← Test file same location
│   └── ...
├── hooks/
│   ├── usePermissions.ts
│   └── usePermissions.test.ts
└── test/
    ├── setup.ts              ← Shared test setup
    └── mocks/                ← Mock data
```

## 🎯 What to Test

### Routes (Backend)

- ✅ Success cases (200, 201 status)
- ✅ Error cases (400, 401, 403, 404)
- ✅ Input validation
- ✅ Authorization checks
- ✅ Database operations

### Services (Frontend & Backend)

- ✅ API calls
- ✅ Data transformation
- ✅ Error handling
- ✅ Caching (if applicable)
- ✅ Local storage operations

### Components (Frontend)

- ✅ Rendering
- ✅ User interactions
- ✅ Props handling
- ✅ State changes
- ✅ Error states

### Models (Backend)

- ✅ Field validation
- ✅ Associations
- ✅ Hooks (beforeCreate, afterUpdate, etc.)
- ✅ Virtual fields
- ✅ Custom methods

## 🔍 Coverage Goals by Area

| Area      | Unit | Integration | Component | Target |
| --------- | ---- | ----------- | --------- | ------ |
| Auth      | 100% | 90%         | 90%       | 100%   |
| Sales     | 95%  | 90%         | 85%       | 95%    |
| Products  | 90%  | 85%         | 80%       | 90%    |
| Customers | 85%  | 80%         | 75%       | 85%    |
| Reports   | 80%  | 70%         | 75%       | 80%    |

## 🐛 Debugging Tests

### Backend

```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Then open: chrome://inspect in Google Chrome
```

### Frontend

```bash
# Run tests with UI for debugging
npm run test:ui

# Or use VSCode debugger with breakpoints
```

### Common Issues

**Database connection errors:**

- Ensure MySQL is running
- Check .env DB credentials
- Verify migrations ran: `npm run migrate`

**Module not found:**

- Check import paths
- Ensure files are created
- Check tsconfig paths

**Coverage not improving:**

- Verify test files in covered paths
- Check collectCoverageFrom in config
- Ensure tests actually run (`npm run test:coverage`)

## 📚 Test Helpers

### Backend Helpers

```typescript
import {
  initializeTestDatabase,
  closeTestDatabase,
  syncDatabase,
  clearDatabase,
  seedTestData,
} from "../test/helpers";

// Use in beforeAll/afterAll
beforeAll(() => initializeTestDatabase());
afterAll(() => closeTestDatabase());
afterEach(() => clearDatabase());
```

### Frontend Mocks

```typescript
import { vi } from "vitest";

// Mock API responses
vi.mock("../utils/api", () => ({
  default: {
    fetch: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

// Mock localStorage
storage.setItem = vi.fn();
storage.getItem = vi.fn();
```

## ✅ Checklist Before Committing

- [ ] All tests pass locally
- [ ] Coverage meets threshold (60% minimum)
- [ ] No linting errors
- [ ] PR contains test coverage report
- [ ] Tests follow naming conventions
- [ ] Test file structure matches source
- [ ] Edge cases covered
- [ ] Error scenarios tested

## 🔗 Useful Links

- **GitHub Issues:** [View all test issues](https://github.com/zaselalk/ZTech-POS/issues)
- **Test Roadmap:** [TEST_IMPLEMENTATION_ROADMAP.md](./TEST_IMPLEMENTATION_ROADMAP.md)
- **Vitest Docs:** https://vitest.dev
- **Jest Docs:** https://jestjs.io
- **Testing Library:** https://testing-library.com
- **Supertest:** https://github.com/visionmedia/supertest

## 💡 Pro Tips

1. **Start with critical paths** - Auth and sales first
2. **Use TDD** - Write test first, then code
3. **Keep tests focused** - One test = one concept
4. **Mock external dependencies** - APIs, database for unit tests
5. **Use fixtures** - Reusable test data
6. **Test behavior, not implementation** - Black box approach
7. **Aim for readable tests** - They're documentation too

## 🚀 Getting Started Now

1. Pick a Milestone 1 issue from GitHub
2. Create a feature branch: `test/auth-route-tests`
3. Follow TDD: Write test first
4. Use examples above as templates
5. Run coverage: `npm run test:coverage`
6. Create PR with results
7. Merge after review

**Happy Testing! 🎉**
