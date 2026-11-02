import { describe, expect, it } from 'vitest';
import { openingPicnics, validateRequest } from './challenges';
describe('picnic content constraints', () => {
  it('keeps all opening requests feasible at the starting level', () => {
    for (const request of openingPicnics) expect(validateRequest(request, 'small')).toBe(true);
  });
  it('limits the whole picnic, including prefilled portions', () => {
    const request = { id: 'larger', portions: [3, 3], prefilled: [1, 1] };
    expect(validateRequest(request, 'small')).toBe(false);
    expect(validateRequest(request, 'expanded')).toBe(true);
  });
  it.each([
    { id: 'empty', portions: [], prefilled: [] },
    { id: 'mismatch', portions: [2], prefilled: [] },
    { id: 'fraction', portions: [1.5], prefilled: [0] },
    { id: 'negative', portions: [2], prefilled: [-1] },
    { id: 'excess', portions: [2], prefilled: [3] },
  ])('rejects invalid content: $id', (request) => {
    expect(validateRequest(request, 'small')).toBe(false);
  });
});
