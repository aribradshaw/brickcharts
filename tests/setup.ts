import '@testing-library/jest-dom';

// Mock localStorage for testing
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0
  },
  writable: true
});

// Mock URL.createObjectURL for export tests
Object.defineProperty(window.URL, 'createObjectURL', {
  value: vi.fn(() => 'mocked-blob-url'),
  writable: true
});

Object.defineProperty(window.URL, 'revokeObjectURL', {
  value: vi.fn(),
  writable: true
});

// Mock console methods to reduce test noise
console.warn = vi.fn();
console.error = vi.fn();

// Global test timeout
vi.setConfig({ testTimeout: 10000 }); 