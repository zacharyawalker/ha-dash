import { describe, it, expect } from 'vitest';
import { generateId } from '../utils/id';

describe('generateId', () => {
  it('generates a string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
  });

  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });

  it('generates UUID-like format (8-4-4-4-12)', () => {
    const id = generateId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it('is not empty', () => {
    const id = generateId();
    expect(id.length).toBeGreaterThan(0);
  });
});
