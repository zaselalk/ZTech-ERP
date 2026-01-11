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
    'auth/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },
  // Progressive coverage thresholds:
  // Phase 1 (Current): 60% - Foundation phase (Milestones 1-2)
  // Phase 2 (After M2): 65% - Growth phase (Milestones 2-4)
  // Phase 3 (After M4): 75% - Enforcement phase (Milestones 5-8)
  // Target: 80%+ by project completion
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  verbose: true
};
