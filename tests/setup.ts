import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import '@testing-library/jest-dom/vitest';
import { vi, beforeEach } from 'vitest';

// Rozszerzanie expect o matchery z testing-library
expect.extend(matchers);

// Czyszczenie DOM po każdym teście
afterEach(() => {
  cleanup();
});

// Mock matchMedia if not available (required for some components)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Global beforeEach for tests
beforeEach(() => {
  vi.resetAllMocks();
}); 