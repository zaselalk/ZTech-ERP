# Test Plan for ZTech-ERP (Bookshop Management System)

## Table of Contents
1. [Overview](#overview)
2. [Test Strategy](#test-strategy)
3. [Test Infrastructure](#test-infrastructure)
4. [Test Coverage Goals](#test-coverage-goals)
5. [Testing Layers](#testing-layers)
6. [Test Execution](#test-execution)
7. [Test Maintenance](#test-maintenance)
8. [Appendix](#appendix)

---

## 1. Overview

### 1.1 Purpose
This document outlines the comprehensive testing strategy for the ZTech-ERP (Bookshop Management System) - a full-stack application with React + TypeScript frontend and Node.js + Express backend.

### 1.2 Scope
- **Frontend Testing**: React components, services, hooks, and utilities
- **Backend Testing**: API routes, models, services, middleware, and authentication
- **Integration Testing**: End-to-end user workflows
- **Performance Testing**: Load testing for API endpoints
- **Security Testing**: Authentication, authorization, and input validation

### 1.3 Current State
**Frontend:**
- Test Framework: Vitest configured ✅
- Test Library: React Testing Library ✅
- Existing Tests: 3 test files (settingsService, Reports, IssueComponents)
- Test Setup: Configured with jsdom environment ✅

**Backend:**
- Test Framework: Not configured ❌
- Existing Tests: None ❌
- Test Script: Placeholder only ❌

---

## 2. Test Strategy

### 2.1 Testing Pyramid

```
                    /\
                   /  \    E2E Tests (5%)
                  /____\   
                 /      \   Integration Tests (15%)
                /________\
               /          \  Unit Tests (80%)
              /__________\
```

**Distribution:**
- **80% Unit Tests**: Test individual functions, components, and modules in isolation
- **15% Integration Tests**: Test interactions between modules and API endpoints
- **5% E2E Tests**: Test complete user workflows through the UI

### 2.2 Test Types

#### Unit Tests
- **Frontend**: Component logic, service functions, utilities, hooks
- **Backend**: Route handlers, model methods, middleware, utilities

#### Integration Tests
- **Frontend**: Component interactions, service integration with API client
- **Backend**: API endpoint workflows, database operations, authentication flow

#### End-to-End Tests
- Complete user workflows (login, create sale, generate reports, etc.)
- Cross-browser testing
- Mobile responsiveness

#### Performance Tests
- API response times
- Database query optimization
- Frontend rendering performance

#### Security Tests
- Authentication and authorization
- Input validation and sanitization
- SQL injection prevention
- XSS prevention
- CSRF protection

---

## 3. Test Infrastructure

### 3.1 Frontend Test Stack

**Framework & Tools:**
```json
{
  "testFramework": "Vitest",
  "testLibrary": "@testing-library/react",
  "assertions": "vitest (expect)",
  "mocking": "vitest (vi)",
  "coverage": "vitest (via v8/istanbul)"
}
```

**Configuration:** `vite.config.js`
```javascript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    exclude: ['node_modules/', 'src/test/']
  }
}
```

**Test Script:**
```bash
npm run test          # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run test:ui       # Run tests with UI (vitest ui)
```

### 3.2 Backend Test Stack

**Recommended Framework & Tools:**
```json
{
  "testFramework": "Jest",
  "httpTesting": "supertest",
  "mocking": "jest",
  "database": "separate test database",
  "coverage": "jest"
}
```

**Required Dependencies:**
```bash
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

**Configuration:** `jest.config.js`
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'routes/**/*.ts',
    'middleware/**/*.ts',
    'services/**/*.ts',
    'utils/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

**Test Database Configuration:**
Create `server/.env.test`:
```env
DB_HOST=localhost
DB_USER=test_user
DB_PASSWORD=test_password
DB_NAME=ztech_erp_test
DB_DIALECT=mysql
JWT_SECRET=test_jwt_secret_key_12345
```

**Test Script:**
```bash
npm run test              # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage
npm run test:integration  # Run integration tests only
npm run test:unit         # Run unit tests only
```

### 3.3 E2E Test Stack (Future)

**Recommended Tools:**
- **Playwright**: Modern, reliable E2E testing
- **Cypress**: Alternative with great developer experience

---

## 4. Test Coverage Goals

### 4.1 Overall Coverage Targets

| Metric | Target | Current | Priority |
|--------|--------|---------|----------|
| Unit Test Coverage | 80% | ~2% | High |
| Integration Test Coverage | 70% | 0% | High |
| Critical Path E2E Tests | 100% | 0% | Medium |
| API Endpoint Tests | 90% | 0% | High |
| Component Tests | 75% | ~1% | High |

### 4.2 Priority Areas for Testing

#### 🔴 Critical (Must Test)
1. **Authentication & Authorization**
   - Login/logout flow
   - JWT token validation
   - Protected route access
   - User roles and permissions

2. **Sales & Transactions**
   - Sale creation
   - Sale returns
   - Payment processing
   - Receipt generation
   - Stock updates on sale

3. **Inventory Management**
   - Product CRUD operations
   - Stock quantity tracking
   - Low stock alerts
   - Product transfers between warehouses

4. **Financial Operations**
   - Purchase orders
   - Supplier payments
   - Customer credit management
   - Report generation

#### 🟡 Important (Should Test)
5. **Warehouse Management**
   - Warehouse CRUD operations
   - Stock transfers
   - Warehouse reports

6. **Customer & Supplier Management**
   - CRUD operations
   - Payment tracking
   - Transaction history

7. **Quotations**
   - Quotation creation
   - Conversion to sales
   - PDF generation

#### 🟢 Nice to Have (Could Test)
8. **Settings & Configuration**
   - Business settings updates
   - User preferences
   - System configuration

9. **Backup & Recovery**
   - Backup creation
   - Backup restoration
   - Scheduled backups

10. **Reports & Analytics**
    - Sales reports
    - Stock reports
    - Financial reports
    - Dashboard statistics

---

## 5. Testing Layers

### 5.1 Frontend Testing

#### 5.1.1 Service Layer Tests
Test all service modules that communicate with the backend API.

**Example: `authService.test.ts`**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './authService';
import api from '../utils/api';

vi.mock('../utils/api');

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    it('should login successfully and store token', async () => {
      const mockResponse = { token: 'test-token', user: { id: 1, username: 'admin' } };
      (api.fetch as any).mockResolvedValue(mockResponse);

      const result = await authService.login('admin', 'password');

      expect(api.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          data: { username: 'admin', password: 'password' }
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on invalid credentials', async () => {
      (api.fetch as any).mockRejectedValue(new Error('Invalid credentials'));

      await expect(authService.login('admin', 'wrong')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should clear token from localStorage', () => {
      localStorage.setItem('token', 'test-token');
      authService.logout();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });
});
```

**Services to Test:**
- [x] `settingsService.ts` (already tested)
- [ ] `authService.ts`
- [ ] `productService.ts`
- [ ] `salesService.ts`
- [ ] `customerService.ts`
- [ ] `supplierService.ts`
- [ ] `warehouseService.ts`
- [ ] `reportService.ts`
- [ ] `dashboardService.ts`
- [ ] `purchaseService.ts`
- [ ] `quotationService.ts`
- [ ] `issueService.ts`
- [ ] `backupService.ts`
- [ ] `userService.ts`

#### 5.1.2 Component Tests
Test React components in isolation with mocked dependencies.

**Example: `Products.test.tsx`**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Products from './Products';
import { productService } from '../services';

vi.mock('../services', () => ({
  productService: {
    getProducts: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn()
  }
}));

describe('Products Component', () => {
  const mockProducts = [
    { id: 1, name: 'Product 1', price: 100, quantity: 50 },
    { id: 2, name: 'Product 2', price: 200, quantity: 30 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (productService.getProducts as any).mockResolvedValue(mockProducts);
  });

  it('renders products list', async () => {
    render(<BrowserRouter><Products /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });
  });

  it('opens create modal when Add Product button is clicked', async () => {
    render(<BrowserRouter><Products /></BrowserRouter>);

    const addButton = screen.getByText('Add Product');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create Product')).toBeInTheDocument();
    });
  });

  it('filters products by search term', async () => {
    render(<BrowserRouter><Products /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search products...');
    fireEvent.change(searchInput, { target: { value: 'Product 1' } });

    // Products should be filtered
    expect(productService.getProducts).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'Product 1' })
    );
  });
});
```

**Components to Test:**
- [x] `Reports.tsx` (partially tested)
- [ ] `Products.tsx`
- [ ] `Sales.tsx`
- [ ] `Customers.tsx`
- [ ] `Suppliers.tsx`
- [ ] `Warehouses.tsx`
- [ ] `Dashboard.tsx`
- [ ] `Settings.tsx`
- [ ] `Users.tsx`
- [ ] `PosPage.tsx`
- [ ] `LoginPage.tsx`
- [ ] Feature components in `components/features/`

#### 5.1.3 Hook Tests
Test custom React hooks.

**Example: `useAuth.test.ts`** (if exists)
```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('should return user when authenticated', () => {
    localStorage.setItem('token', 'test-token');
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should logout user', () => {
    localStorage.setItem('token', 'test-token');
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });
});
```

#### 5.1.4 Utility Tests
Test utility functions.

**Example: `utils.test.ts`**
```typescript
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from './utils';

describe('formatCurrency', () => {
  it('should format number as currency with Rs. prefix', () => {
    expect(formatCurrency(1234.56)).toBe('Rs. 1,234.56');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('Rs. 0.00');
  });

  it('should handle negative numbers', () => {
    expect(formatCurrency(-1234.56)).toBe('Rs. -1,234.56');
  });
});

describe('formatDate', () => {
  it('should format date string correctly', () => {
    const date = '2024-01-15T10:30:00Z';
    expect(formatDate(date)).toMatch(/2024/);
  });
});
```

### 5.2 Backend Testing

#### 5.2.1 API Route Tests
Test API endpoints with supertest.

**Example: `routes/auth.test.ts`**
```typescript
import request from 'supertest';
import { app } from '../app';
import { sequelize } from '../db/models';
import { User } from '../db/models/user';

describe('Auth Routes', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      await User.create({
        username: 'testuser',
        password: '$2b$10$hashedpassword', // Pre-hashed
        email: 'test@test.com',
        role: 'admin'
      });
    });

    afterEach(async () => {
      await User.destroy({ where: {} });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('username', 'testuser');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'wrongpassword' })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should reject missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nonexistent', password: 'password123' })
        .expect(401);
    });
  });
});
```

**Routes to Test:**
- [ ] `routes/auth.ts`
- [ ] `routes/products.ts`
- [ ] `routes/sales.ts`
- [ ] `routes/customers.ts`
- [ ] `routes/suppliers.ts`
- [ ] `routes/warehouses.ts`
- [ ] `routes/purchases.ts`
- [ ] `routes/quotations.ts`
- [ ] `routes/reports.ts`
- [ ] `routes/dashboard.ts`
- [ ] `routes/settings.ts`
- [ ] `routes/users.ts`
- [ ] `routes/backups.ts`
- [ ] `routes/issues.ts`

#### 5.2.2 Middleware Tests
Test Express middleware functions.

**Example: `middleware/requireAuth.test.ts`**
```typescript
import { Request, Response, NextFunction } from 'express';
import { requireAuth } from './requireAuth';
import jwt from 'jsonwebtoken';

describe('requireAuth Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should call next() with valid token', () => {
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    req.headers = { authorization: `Bearer ${token}` };

    requireAuth(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
  });

  it('should return 401 without token', () => {
    requireAuth(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.any(String)
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 with invalid token', () => {
    req.headers = { authorization: 'Bearer invalid-token' };

    requireAuth(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
```

**Middleware to Test:**
- [ ] `middleware/requireAuth.ts`
- [ ] `middleware/errorHandler.ts`
- [ ] Custom validation middleware (if exists)

#### 5.2.3 Model Tests
Test Sequelize model methods and validations.

**Example: `db/models/product.test.ts`**
```typescript
import { sequelize } from './index';
import { Product } from './product';

describe('Product Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await Product.destroy({ where: {} });
  });

  it('should create a product with valid data', async () => {
    const product = await Product.create({
      name: 'Test Product',
      sku: 'TEST-001',
      price: 100,
      quantity: 50,
      warehouseId: 1
    });

    expect(product.id).toBeDefined();
    expect(product.name).toBe('Test Product');
    expect(product.price).toBe(100);
  });

  it('should not create product without required fields', async () => {
    await expect(Product.create({
      name: 'Test Product'
    } as any)).rejects.toThrow();
  });

  it('should validate unique SKU', async () => {
    await Product.create({
      name: 'Product 1',
      sku: 'TEST-001',
      price: 100,
      quantity: 50,
      warehouseId: 1
    });

    await expect(Product.create({
      name: 'Product 2',
      sku: 'TEST-001',
      price: 200,
      quantity: 30,
      warehouseId: 1
    })).rejects.toThrow();
  });

  it('should update stock quantity', async () => {
    const product = await Product.create({
      name: 'Test Product',
      sku: 'TEST-001',
      price: 100,
      quantity: 50,
      warehouseId: 1
    });

    await product.update({ quantity: 45 });
    expect(product.quantity).toBe(45);
  });
});
```

**Models to Test:**
- [ ] `Product.ts`
- [ ] `Sale.ts`
- [ ] `SaleItem.ts`
- [ ] `Purchase.ts`
- [ ] `PurchaseItem.ts`
- [ ] `Customer.ts`
- [ ] `Supplier.ts`
- [ ] `Warehouse.ts`
- [ ] `User.ts`
- [ ] `Quotation.ts`
- [ ] Other models

#### 5.2.4 Service Tests
Test business logic in service modules (if they exist).

**Example: `services/saleService.test.ts`**
```typescript
import { saleService } from './saleService';
import { Sale, SaleItem, Product } from '../db/models';

jest.mock('../db/models');

describe('SaleService', () => {
  describe('createSale', () => {
    it('should create sale and update stock', async () => {
      const saleData = {
        customerId: 1,
        items: [
          { productId: 1, quantity: 2, price: 100 },
          { productId: 2, quantity: 1, price: 200 }
        ]
      };

      const result = await saleService.createSale(saleData);

      expect(Sale.create).toHaveBeenCalled();
      expect(SaleItem.create).toHaveBeenCalledTimes(2);
      expect(Product.decrement).toHaveBeenCalledTimes(2);
    });

    it('should rollback on insufficient stock', async () => {
      // Mock insufficient stock scenario
      (Product.findByPk as jest.Mock).mockResolvedValue({ quantity: 1 });

      const saleData = {
        customerId: 1,
        items: [{ productId: 1, quantity: 5, price: 100 }]
      };

      await expect(saleService.createSale(saleData)).rejects.toThrow('Insufficient stock');
    });
  });
});
```

### 5.3 Integration Testing

#### 5.3.1 API Integration Tests
Test complete workflows through the API.

**Example: `integration/sales-workflow.test.ts`**
```typescript
import request from 'supertest';
import { app } from '../app';
import { sequelize } from '../db/models';

describe('Sales Workflow Integration', () => {
  let authToken: string;
  let productId: number;
  let customerId: number;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Setup: Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    authToken = loginRes.body.token;

    // Setup: Create product
    const productRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Book',
        sku: 'BOOK-001',
        price: 500,
        quantity: 100,
        warehouseId: 1
      });
    productId = productRes.body.id;

    // Setup: Create customer
    const customerRes = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Customer',
        email: 'customer@test.com',
        phone: '1234567890'
      });
    customerId = customerRes.body.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should complete full sales workflow', async () => {
    // Step 1: Create sale
    const saleRes = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        customerId,
        items: [
          { productId, quantity: 2, price: 500 }
        ],
        paymentMethod: 'cash',
        totalAmount: 1000
      })
      .expect(201);

    const saleId = saleRes.body.id;
    expect(saleRes.body.totalAmount).toBe(1000);

    // Step 2: Verify stock decreased
    const productRes = await request(app)
      .get(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(productRes.body.quantity).toBe(98); // 100 - 2

    // Step 3: Get sale details
    const saleDetailRes = await request(app)
      .get(`/api/sales/${saleId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(saleDetailRes.body.items).toHaveLength(1);
    expect(saleDetailRes.body.items[0].quantity).toBe(2);

    // Step 4: Create sale return
    const returnRes = await request(app)
      .post('/api/sale-returns')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        saleId,
        items: [
          { saleItemId: saleDetailRes.body.items[0].id, quantity: 1, reason: 'Damaged' }
        ]
      })
      .expect(201);

    // Step 5: Verify stock increased after return
    const finalProductRes = await request(app)
      .get(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(finalProductRes.body.quantity).toBe(99); // 98 + 1 returned
  });
});
```

#### 5.3.2 Frontend-Backend Integration
Test frontend services with real API (in test environment).

---

## 6. Test Execution

### 6.1 Running Tests

#### Frontend Tests
```bash
# Run all tests
cd client
npm run test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test settingsService.test.ts

# Run tests with UI
npm run test:ui
```

#### Backend Tests
```bash
# Run all tests
cd server
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run specific test file
npm run test auth.test.ts
```

### 6.2 Continuous Integration (CI)

**GitHub Actions Workflow:** `.github/workflows/test.yml`
```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd client && npm ci
      - name: Run tests
        run: cd client && npm run test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./client/coverage/coverage-final.json

  backend-tests:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8
        env:
          MYSQL_ROOT_PASSWORD: test_password
          MYSQL_DATABASE: ztech_erp_test
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd server && npm ci
      - name: Run migrations
        run: cd server && npm run migrate
        env:
          DB_HOST: localhost
          DB_USER: root
          DB_PASSWORD: test_password
          DB_NAME: ztech_erp_test
          JWT_SECRET: test_jwt_secret_key
      - name: Run tests
        run: cd server && npm run test:coverage
        env:
          DB_HOST: localhost
          DB_USER: root
          DB_PASSWORD: test_password
          DB_NAME: ztech_erp_test
          JWT_SECRET: test_jwt_secret_key
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./server/coverage/coverage-final.json
```

### 6.3 Pre-commit Hooks

**Using Husky:**
```bash
# Install husky
npm install --save-dev husky

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "cd client && npm run test && cd ../server && npm run test"
```

### 6.4 Test Reporting

**Coverage Reports:**
- Generate HTML reports: `npm run test:coverage`
- Reports location: 
  - Frontend: `client/coverage/`
  - Backend: `server/coverage/`

**Coverage Badges:**
Add badges to README.md:
```markdown
[![Frontend Coverage](https://codecov.io/gh/zaselalk/ZTech-ERP/branch/main/graph/badge.svg?flag=frontend)](https://codecov.io/gh/zaselalk/ZTech-ERP)
[![Backend Coverage](https://codecov.io/gh/zaselalk/ZTech-ERP/branch/main/graph/badge.svg?flag=backend)](https://codecov.io/gh/zaselalk/ZTech-ERP)
```

---

## 7. Test Maintenance

### 7.1 Test Data Management

**Test Fixtures:**
Create reusable test data in `server/test/fixtures/`:

```typescript
// server/test/fixtures/products.ts
export const mockProducts = [
  {
    id: 1,
    name: 'Test Product 1',
    sku: 'TEST-001',
    price: 100,
    quantity: 50,
    warehouseId: 1
  },
  {
    id: 2,
    name: 'Test Product 2',
    sku: 'TEST-002',
    price: 200,
    quantity: 30,
    warehouseId: 1
  }
];

export const createMockProduct = (overrides = {}) => ({
  name: 'Test Product',
  sku: 'TEST-' + Math.random().toString(36).substr(2, 9),
  price: 100,
  quantity: 50,
  warehouseId: 1,
  ...overrides
});
```

### 7.2 Test Database Management

**Database Seeding for Tests:**
```typescript
// server/test/helpers/seedDatabase.ts
import { sequelize } from '../../db/models';
import { User, Product, Warehouse } from '../../db/models';

export async function seedTestDatabase() {
  await sequelize.sync({ force: true });

  // Create test warehouse
  await Warehouse.create({
    id: 1,
    name: 'Test Warehouse',
    location: 'Test Location'
  });

  // Create test user
  await User.create({
    id: 1,
    username: 'testuser',
    password: '$2b$10$...',
    email: 'test@test.com',
    role: 'admin'
  });

  // Create test products
  await Product.bulkCreate([
    { name: 'Product 1', sku: 'P001', price: 100, quantity: 50, warehouseId: 1 },
    { name: 'Product 2', sku: 'P002', price: 200, quantity: 30, warehouseId: 1 }
  ]);
}

export async function cleanTestDatabase() {
  await sequelize.sync({ force: true });
}
```

### 7.3 Mocking Best Practices

**API Mocking (Frontend):**
```typescript
// client/src/test/mocks/api.ts
import { vi } from 'vitest';

export const createMockApi = () => ({
  fetch: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
});
```

**External Service Mocking (Backend):**
```typescript
// server/test/mocks/emailService.ts
export const mockEmailService = {
  sendEmail: jest.fn().mockResolvedValue(true),
  sendReceipt: jest.fn().mockResolvedValue(true)
};
```

### 7.4 Test Organization

**Directory Structure:**
```
client/src/
├── components/
│   ├── Products.tsx
│   └── Products.test.tsx
├── services/
│   ├── productService.ts
│   └── productService.test.ts
└── test/
    ├── setup.ts
    ├── mocks/
    └── fixtures/

server/
├── routes/
│   ├── products.ts
│   └── products.test.ts
├── middleware/
│   ├── requireAuth.ts
│   └── requireAuth.test.ts
└── test/
    ├── setup.ts
    ├── helpers/
    ├── fixtures/
    └── integration/
```

### 7.5 Continuous Improvement

**Metrics to Track:**
- Test coverage percentage
- Test execution time
- Number of flaky tests
- Test failure rate
- Code churn vs test updates

**Regular Reviews:**
- Monthly test coverage review
- Quarterly test strategy review
- Update test plan based on new features
- Refactor tests when code changes significantly

---

## 8. Appendix

### 8.1 Test Checklist for New Features

When adding a new feature, ensure:

- [ ] Unit tests for all new functions/methods
- [ ] Component tests for new React components
- [ ] Service tests for new API service methods
- [ ] API route tests for new endpoints
- [ ] Model tests for new database models
- [ ] Integration tests for critical workflows
- [ ] Update test fixtures if needed
- [ ] Update test documentation
- [ ] All tests pass locally
- [ ] Coverage meets minimum threshold

### 8.2 Common Testing Patterns

#### Testing Async Operations
```typescript
it('should handle async operations', async () => {
  const promise = asyncFunction();
  await expect(promise).resolves.toBe(expectedValue);
});
```

#### Testing Error Handling
```typescript
it('should throw error on invalid input', async () => {
  await expect(functionThatThrows()).rejects.toThrow('Error message');
});
```

#### Testing with Timers
```typescript
import { vi } from 'vitest';

it('should handle delayed operations', async () => {
  vi.useFakeTimers();
  const callback = vi.fn();
  
  setTimeout(callback, 1000);
  vi.advanceTimersByTime(1000);
  
  expect(callback).toHaveBeenCalled();
  vi.useRealTimers();
});
```

### 8.3 Testing Tools Reference

**Vitest Matchers:**
- `expect(value).toBe(expected)` - Strict equality
- `expect(value).toEqual(expected)` - Deep equality
- `expect(value).toBeTruthy()` - Truthy value
- `expect(value).toBeDefined()` - Not undefined
- `expect(value).toContain(item)` - Array contains
- `expect(string).toMatch(/regex/)` - Regex match
- `expect(fn).toHaveBeenCalled()` - Function called
- `expect(fn).toHaveBeenCalledWith(args)` - Called with args

**React Testing Library Queries:**
- `getByText(text)` - Get element by text content
- `getByRole(role)` - Get element by ARIA role
- `getByLabelText(label)` - Get form element by label
- `getByPlaceholderText(placeholder)` - Get by placeholder
- `getByTestId(testId)` - Get by data-testid attribute
- `queryBy*` - Same as getBy but returns null if not found
- `findBy*` - Async version, waits for element

**User Event Actions:**
```typescript
import userEvent from '@testing-library/user-event';

await userEvent.click(button);
await userEvent.type(input, 'text');
await userEvent.selectOptions(select, 'option');
await userEvent.clear(input);
```

### 8.4 Troubleshooting Common Issues

**Issue: Tests timeout**
- Increase timeout: `it('test', async () => {...}, 10000)`
- Check for unresolved promises
- Ensure async operations complete

**Issue: Flaky tests**
- Use `waitFor` for async operations
- Avoid hardcoded waits (setTimeout)
- Mock time-dependent operations
- Reset mocks between tests

**Issue: Module mocking fails**
- Ensure mock is defined before import
- Use `vi.mock()` at top level
- Check mock file location

**Issue: Database connection errors**
- Verify test database configuration
- Ensure migrations run before tests
- Close connections after tests

### 8.5 Resources

**Documentation:**
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

**Best Practices:**
- [Testing JavaScript Applications](https://testingjavascript.com/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Node.js Applications](https://nodejsbestpractices.com/testing/)

---

## Summary

This test plan provides a comprehensive framework for testing the ZTech-ERP application. The key priorities are:

1. **Set up backend testing infrastructure** (Jest + Supertest)
2. **Expand frontend test coverage** (focus on critical components)
3. **Add integration tests** for critical workflows
4. **Implement CI/CD pipeline** with automated testing
5. **Maintain and improve** tests as the application evolves

By following this plan, the application will achieve:
- **High code quality** through comprehensive testing
- **Faster development** with confidence in changes
- **Reduced bugs** in production
- **Better maintainability** with documented test cases
- **Improved reliability** for end users

---

**Version:** 1.0  
**Last Updated:** 2026-01-10  
**Owner:** Development Team  
**Status:** Active
