# Testing Guide

This directory contains the test infrastructure for the ZTech-ERP backend.

## Directory Structure

```
test/
├── setup.ts              # Global test setup and configuration
├── helpers/              # Test helper utilities
│   └── database.ts       # Database setup and teardown helpers
├── fixtures/             # Reusable test data
│   └── index.ts          # Mock data for entities
└── integration/          # Integration tests (future)
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

This will install Jest, Supertest, and other testing dependencies.

### 2. Configure Test Database

Copy the example environment file:

```bash
cp .env.test.example .env.test
```

Edit `.env.test` with your test database credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=ztech_erp_test
JWT_SECRET=test_jwt_secret_key
```

**Important:** Use a separate database for testing! The test database will be cleared between tests.

### 3. Create Test Database

```bash
# Login to MySQL
mysql -u root -p

# Create test database
CREATE DATABASE ztech_erp_test;

# Exit MySQL
exit
```

### 4. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

## Writing Tests

### Unit Tests

Place unit test files next to the code they test with `.test.ts` extension.

**Example: `routes/auth.test.ts`**

```typescript
import request from 'supertest';
import { app } from '../app';

describe('Auth Routes', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' })
      .expect(200);

    expect(response.body).toHaveProperty('token');
  });
});
```

### Integration Tests

Place integration tests in `test/integration/` directory.

**Example: `test/integration/sales-workflow.test.ts`**

```typescript
import { initTestDatabase, seedTestDatabase, clearTestDatabase } from '../helpers/database';

describe('Sales Workflow Integration', () => {
  beforeAll(async () => {
    await initTestDatabase();
    await seedTestDatabase();
  });

  afterAll(async () => {
    await clearTestDatabase();
  });

  it('should complete a full sales transaction', async () => {
    // Test complete workflow
  });
});
```

## Test Helpers

### Database Helpers

Located in `test/helpers/database.ts`:

- `initTestDatabase()` - Initialize database connection
- `closeTestDatabase()` - Close database connection
- `syncTestDatabase(force)` - Sync schema (force drops tables)
- `clearTestDatabase()` - Clear all data without dropping tables
- `seedTestDatabase()` - Seed database with test data
- `withFreshDatabase(callback)` - Run test with fresh database

**Example:**

```typescript
import { syncTestDatabase, seedTestDatabase } from './helpers/database';

beforeAll(async () => {
  await syncTestDatabase(true);
  const { user, product } = await seedTestDatabase();
  // Use seeded data in tests
});
```

### Test Fixtures

Located in `test/fixtures/index.ts`:

Pre-defined test data for common entities:

- `mockUsers` - User fixtures
- `mockWarehouses` - Warehouse fixtures
- `mockCustomers` - Customer fixtures
- `mockSuppliers` - Supplier fixtures
- `mockProducts` - Product fixtures
- `createMockProduct(overrides)` - Create custom product
- `createMockCustomer(overrides)` - Create custom customer
- `createMockSale(overrides)` - Create custom sale

**Example:**

```typescript
import { mockProducts, createMockProduct } from './fixtures';

// Use predefined fixture
const product = mockProducts[0];

// Create custom fixture
const customProduct = createMockProduct({
  name: 'Custom Product',
  price: 500
});
```

## Best Practices

1. **Isolate Tests**: Each test should be independent and not rely on other tests
2. **Clean Up**: Always clean up test data after tests complete
3. **Mock External Services**: Mock email services, payment gateways, etc.
4. **Use Fixtures**: Reuse test data from fixtures instead of creating inline
5. **Descriptive Names**: Use clear, descriptive test names that explain what is being tested
6. **Test Edge Cases**: Include tests for error conditions and edge cases
7. **Fast Tests**: Keep tests fast by avoiding unnecessary database operations

## Coverage Goals

- **Unit Tests**: 80% coverage target
- **Integration Tests**: 70% coverage target
- **Critical Paths**: 100% coverage required

Run `npm run test:coverage` to see current coverage.

## Troubleshooting

### Database Connection Errors

- Verify test database exists: `SHOW DATABASES;`
- Check credentials in `.env.test`
- Ensure MySQL is running: `sudo service mysql status`

### Tests Timeout

- Increase timeout in `jest.config.js`
- Check for unresolved promises in async tests
- Ensure database connections are properly closed

### Flaky Tests

- Use proper async/await patterns
- Avoid hardcoded delays
- Mock time-dependent operations
- Ensure test isolation

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Push to main branch
- Pre-commit hooks (if configured)

See `.github/workflows/test.yml` for CI configuration.

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Test Plan](../TEST_PLAN.md) - Comprehensive testing strategy
