import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock ResizeObserver
window.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};
