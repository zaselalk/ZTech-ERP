// Test setup file - runs before all tests
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set default test environment variables if not present
if (!process.env.DB_NAME) {
  process.env.DB_NAME = 'ztech_erp_test';
}
if (!process.env.DB_HOST) {
  process.env.DB_HOST = 'localhost';
}
if (!process.env.DB_USER) {
  process.env.DB_USER = 'root';
}
if (!process.env.DB_PASSWORD) {
  process.env.DB_PASSWORD = 'password';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing_only';
}
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}

// Increase test timeout for database operations
jest.setTimeout(10000);
