import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '@resume-builder/lib/logger';

describe('logger', () => {
  const originalEnv = process.env.NODE_ENV;
  const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  const consoleErrorSpy = vi
    .spyOn(console, 'error')
    .mockImplementation(() => {});
  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original NODE_ENV using Object.defineProperty
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
      configurable: true,
    });
  });

  describe('logger.info', () => {
    it('should log in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      });

      // Import logger directly (it checks NODE_ENV at module load time)
      const { logger } = require('@resume-builder/lib/logger');
      logger.info('Test message', { key: 'value' });

      expect(consoleLogSpy).toHaveBeenCalledWith('Test message', {
        key: 'value',
      });
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });

    it('should not log in production mode', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });
      logger.info('Test message');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should not log in test mode', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'test',
        writable: true,
        configurable: true,
      });
      logger.info('Test message');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('logger.error', () => {
    it('should always log errors in development', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      });
      logger.error('Error message', { error: 'details' });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error message', {
        error: 'details',
      });
    });

    it('should always log errors in production', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });
      logger.error('Error message');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error message');
    });

    it('should always log errors in test mode', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'test',
        writable: true,
        configurable: true,
      });
      logger.error('Error message');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error message');
    });
  });

  describe('logger.warn', () => {
    it('should always log warnings in development', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      });
      logger.warn('Warning message', { warning: 'details' });

      expect(consoleWarnSpy).toHaveBeenCalledWith('Warning message', {
        warning: 'details',
      });
    });

    it('should always log warnings in production', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });
      logger.warn('Warning message');

      expect(consoleWarnSpy).toHaveBeenCalledWith('Warning message');
    });
  });
});
