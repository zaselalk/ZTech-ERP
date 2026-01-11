# Testing Implementation Guide

This guide provides step-by-step instructions for implementing the testing infrastructure outlined in [TEST_PLAN.md](TEST_PLAN.md).

## Quick Start

### Prerequisites
- Node.js 18+ installed
- MySQL 8+ installed and running
- Git repository cloned

### Step 1: Install Dependencies

**Frontend:**
```bash
cd client
npm install
```

**Backend:**
```bash
cd server
npm install
```

This will install all testing dependencies including:
- Frontend: vitest, @testing-library/react, @testing-library/jest-dom
- Backend: jest, ts-jest, supertest, @types/jest, @types/supertest

### Step 2: Setup Test Database

1. Create a test database:
```bash
mysql -u root -p
CREATE DATABASE ztech_erp_test;
exit
```

2. Configure test environment:
```bash
cd server
cp .env.test.example .env.test
```

3. Edit `.env.test` with your database credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ztech_erp_test
JWT_SECRET=test_jwt_secret_key_for_testing_only
```

### Step 3: Run Tests

**Frontend Tests:**
```bash
cd client
npm run test              # Run all tests
npm run test:watch        # Run in watch mode
npm run test:coverage     # Run with coverage
```

**Backend Tests:**
```bash
cd server
npm run test              # Run all tests
npm run test:watch        # Run in watch mode
npm run test:coverage     # Run with coverage
```

## What's Been Set Up

### ✅ Completed

1. **Test Plan Document** (`TEST_PLAN.md`)
   - Comprehensive testing strategy
   - Test coverage goals
   - Testing layers and types
   - Examples for all test types
   - Best practices and guidelines

2. **Frontend Test Infrastructure**
   - Vitest configured in `vite.config.js`
   - Test scripts added to `package.json`
   - Test setup file: `client/src/test/setup.ts`
   - Example test: `client/src/services/authService.test.ts`
   - Existing tests: 
     - `client/src/services/settingsService.test.ts`
     - `client/src/components/Reports.test.tsx`
     - `client/src/components/features/issues/IssueComponents.test.tsx`

3. **Backend Test Infrastructure**
   - Jest configuration: `server/jest.config.js`
   - Test scripts added to `package.json`
   - Test setup: `server/test/setup.ts`
   - Database helpers: `server/test/helpers/database.ts`
   - Test fixtures: `server/test/fixtures/index.ts`
   - Example test template: `server/routes/auth.test.ts`
   - Test README: `server/test/README.md`

4. **CI/CD Integration**
   - GitHub Actions workflow: `.github/workflows/test.yml`
   - Automated testing on push and pull requests
   - Separate jobs for frontend and backend
   - MySQL service container for backend tests
   - Coverage reporting to Codecov (optional)

5. **Documentation**
   - Updated main README.md with testing section
   - Comprehensive TEST_PLAN.md
   - Backend testing guide: `server/test/README.md`
   - This implementation guide

6. **Configuration Updates**
   - Updated `.gitignore` to exclude coverage reports
   - Environment example: `server/.env.test.example`

### 🔄 Ready to Implement

The infrastructure is set up. Now you can:

1. **Write More Tests**
   - Follow examples in TEST_PLAN.md
   - Use test fixtures from `server/test/fixtures/`
   - Use database helpers from `server/test/helpers/`

2. **Add Tests for Existing Code**
   - Frontend services (productService, salesService, etc.)
   - Frontend components (Products, Sales, Dashboard, etc.)
   - Backend routes (products, sales, customers, etc.)
   - Backend middleware (requireAuth, errorHandler)
   - Backend models (Product, Sale, Customer, etc.)

3. **Run Tests**
   - After installing dependencies: `npm run test`
   - During development: `npm run test:watch`
   - Before commits: `npm run test:coverage`

## Testing Workflow

### Daily Development

1. **Start with a test** (Test-Driven Development)
   ```bash
   npm run test:watch
   ```

2. **Write a failing test** for the feature you're adding

3. **Implement the feature** until the test passes

4. **Refactor** if needed while keeping tests green

5. **Check coverage** before committing:
   ```bash
   npm run test:coverage
   ```

### Before Committing

```bash
# Run all tests
cd client && npm run test
cd ../server && npm run test

# Check coverage
cd client && npm run test:coverage
cd ../server && npm run test:coverage
```

### Pull Request Process

1. Tests run automatically via GitHub Actions
2. Review test results in PR checks
3. Ensure all tests pass before merging
4. Maintain or improve coverage percentage

## Writing Your First Test

### Frontend Component Test

Create `client/src/components/Products.test.tsx`:

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Products from './Products';
import { productService } from '../services';

vi.mock('../services', () => ({
  productService: {
    getProducts: vi.fn()
  }
}));

describe('Products Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders products list', async () => {
    const mockProducts = [
      { id: 1, name: 'Product 1', price: 100 }
    ];
    
    (productService.getProducts as any).mockResolvedValue(mockProducts);

    render(<BrowserRouter><Products /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });
  });
});
```

### Backend Route Test

Create `server/routes/products.test.ts`:

```typescript
import request from 'supertest';
import { initTestDatabase, seedTestDatabase, clearTestDatabase } from '../test/helpers/database';

describe('Products Routes', () => {
  let authToken: string;

  beforeAll(async () => {
    await initTestDatabase();
    const { user } = await seedTestDatabase();
    
    // Get auth token
    // (requires app setup - see auth.test.ts for template)
  });

  afterAll(async () => {
    await clearTestDatabase();
  });

  it('should get all products', async () => {
    // Test implementation
  });
});
```

## Next Steps

### Immediate (High Priority)

1. **Complete Backend App Export**
   - Update `server/app.ts` to export the Express app
   - This enables backend route testing with supertest

2. **Write Critical Path Tests**
   - Authentication flow (login/logout)
   - Sales creation workflow
   - Product CRUD operations
   - Customer management

3. **Add More Service Tests**
   - Complete all service modules in `client/src/services/`
   - Follow the pattern from `authService.test.ts`

### Short Term (This Week)

4. **Add Component Tests**
   - Test major components (Products, Sales, Customers)
   - Focus on user interactions and data display

5. **Add Route Tests**
   - Test all API endpoints
   - Focus on happy path and error cases

6. **Add Middleware Tests**
   - Test authentication middleware
   - Test error handling middleware

### Medium Term (This Month)

7. **Integration Tests**
   - Test complete workflows
   - Test database transactions
   - Test file uploads/downloads

8. **Improve Coverage**
   - Aim for 80% unit test coverage
   - Aim for 70% integration test coverage

9. **Performance Tests**
   - Load testing for API endpoints
   - Frontend rendering performance

### Long Term

10. **E2E Tests**
    - Install Playwright or Cypress
    - Test complete user journeys
    - Test cross-browser compatibility

11. **Visual Regression Tests**
    - Add screenshot comparison
    - Prevent UI regressions

12. **Security Tests**
    - Penetration testing
    - Dependency vulnerability scanning

## Common Issues and Solutions

### Issue: "vitest: not found"
**Solution:** Install dependencies: `cd client && npm install`

### Issue: "Database connection failed"
**Solution:** 
1. Verify MySQL is running: `sudo service mysql status`
2. Check credentials in `.env.test`
3. Ensure test database exists: `CREATE DATABASE ztech_erp_test;`

### Issue: "Module not found"
**Solution:** Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Issue: "Tests timeout"
**Solution:** 
1. Increase timeout in test: `it('test', async () => {...}, 10000)`
2. Check for unresolved promises
3. Ensure proper async/await usage

### Issue: "Tests fail in CI but pass locally"
**Solution:**
1. Check environment variables in GitHub Actions
2. Ensure database service is running in CI
3. Check for hardcoded localhost references

## Resources

- [TEST_PLAN.md](TEST_PLAN.md) - Complete testing strategy
- [server/test/README.md](server/test/README.md) - Backend testing guide
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

## Getting Help

If you encounter issues:
1. Check this guide and TEST_PLAN.md
2. Review example tests in the codebase
3. Check test output for specific error messages
4. Review relevant documentation links above

## Summary

The testing infrastructure is now complete and ready to use. The main components are:

1. ✅ Test framework configured (Vitest for frontend, Jest for backend)
2. ✅ Test scripts added to package.json
3. ✅ Test helpers and fixtures created
4. ✅ Example tests provided
5. ✅ CI/CD pipeline configured
6. ✅ Documentation complete

**Next step:** Install dependencies and start writing tests!

```bash
# Install dependencies
npm install

# Run tests
cd client && npm run test
cd ../server && npm run test
```

Happy testing! 🎉
