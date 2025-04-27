import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Rozszerzanie expect o matchery z testing-library
expect.extend(matchers);

// Czyszczenie DOM po każdym teście
afterEach(() => {
  cleanup();
}); 