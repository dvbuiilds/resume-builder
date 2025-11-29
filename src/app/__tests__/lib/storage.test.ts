import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createDualStorage } from '@resume-builder/lib/storage';

describe('storage', () => {
  const originalWindow = global.window;
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  };
  const mockSessionStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup window mocks
    Object.defineProperty(global, 'window', {
      value: {
        localStorage: mockLocalStorage,
        sessionStorage: mockSessionStorage,
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  describe('createDualStorage - client-side', () => {
    it('should get item from localStorage first', () => {
      // createJSONStorage handles JSON serialization, so we pass raw values
      mockLocalStorage.getItem.mockReturnValue('local-value');
      mockSessionStorage.getItem.mockReturnValue('session-value');

      const storage = createDualStorage();
      expect(storage).toBeDefined();
      const result = storage!.getItem('test-key');

      expect(result).toBe('local-value');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key');
    });

    it('should fallback to sessionStorage when localStorage is null', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockSessionStorage.getItem.mockReturnValue('session-value');

      const storage = createDualStorage();
      expect(storage).toBeDefined();
      const result = storage!.getItem('test-key');

      expect(result).toBe('session-value');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key');
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('test-key');
    });

    it('should return null when both storages are empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockSessionStorage.getItem.mockReturnValue(null);

      const storage = createDualStorage();
      expect(storage).toBeDefined();
      const result = storage!.getItem('test-key');

      expect(result).toBeNull();
    });

    it('should set item in both storages', () => {
      const storage = createDualStorage();
      expect(storage).toBeDefined();
      // createJSONStorage will serialize the value, so we pass the raw value
      storage!.setItem('test-key', 'test-value' as any);

      // The storage will serialize it, so we check for the serialized version
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      expect(mockSessionStorage.setItem).toHaveBeenCalled();
      // Both should be called with the same key
      const localStorageCall = mockLocalStorage.setItem.mock.calls[0];
      const sessionStorageCall = mockSessionStorage.setItem.mock.calls[0];
      expect(localStorageCall[0]).toBe('test-key');
      expect(sessionStorageCall[0]).toBe('test-key');
    });

    it('should remove item from both storages', () => {
      const storage = createDualStorage();
      expect(storage).toBeDefined();
      storage!.removeItem('test-key');

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key');
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('test-key');
    });
  });

  describe('createDualStorage - server-side', () => {
    beforeEach(() => {
      // @ts-ignore
      delete global.window;
    });

    it('should return no-op functions when window is undefined', () => {
      const storage = createDualStorage();
      expect(storage).toBeDefined();

      // Should not throw
      expect(() => storage!.getItem('test')).not.toThrow();
      expect(() => storage!.setItem('test', 'value' as any)).not.toThrow();
      expect(() => storage!.removeItem('test')).not.toThrow();

      expect(storage!.getItem('test')).toBeNull();
    });
  });
});
