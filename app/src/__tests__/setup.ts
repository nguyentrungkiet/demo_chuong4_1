import { beforeAll, vi } from 'vitest';

// Mock environment setup
beforeAll(() => {
  // Mock console methods to reduce noise in tests
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  
  // Mock Date.now for consistent timestamps in tests
  const mockTimestamp = 1695123456789;
  vi.spyOn(Date, 'now').mockReturnValue(mockTimestamp);
});