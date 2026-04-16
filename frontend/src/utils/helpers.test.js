import { describe, it, expect } from 'vitest';
import { getColorForCategory, NEON_COLORS } from './helpers';

describe('getColorForCategory', () => {
    it('returns the exact same color for the same input', () => {
        const color1 = getColorForCategory('Food');
        const color2 = getColorForCategory('Food');
        expect(color1).toBe(color2);
    });

    it('returns different colors for different inputs', () => {
        const color1 = getColorForCategory('Food');
        const color2 = getColorForCategory('Transport');
        expect(color1).not.toBe(color2);
    });

    it('returns default color for null or empty input', () => {
        expect(getColorForCategory(null)).toBe(NEON_COLORS[0]);
        expect(getColorForCategory('')).toBe(NEON_COLORS[0]);
    });
});
