import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDistance } from '../utils/formatters';

describe('Formatters', () => {
    describe('formatCurrency', () => {
        it('should format numbers as currency', () => {
            expect(formatCurrency(10.5)).toBe('$10.50');
            expect(formatCurrency(0)).toBe('$0.00');
            expect(formatCurrency(100)).toBe('$100.00');
        });

        it('should handle string inputs correctly', () => {
            expect(formatCurrency('20.5')).toBe('$20.50');
        });
    });

    describe('formatDistance', () => {
        it('should format distance in meters to km', () => {
            expect(formatDistance(1500)).toBe('1.50 km');
            expect(formatDistance(500)).toBe('0.50 km');
        });

        it('should handle zero distance', () => {
            expect(formatDistance(0)).toBe('0.00 km');
        });
    });
});
