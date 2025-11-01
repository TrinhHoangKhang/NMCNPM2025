// Import the function we want to test
const { isValidEmail } = require('../../src/utils/validators');

// 'describe' groups related tests together
describe('Utility: isValidEmail', () => {

    // 'test' (or 'it') defines a single test case
    test('should return true for a valid email', () => {
        // expect(...).toBe(...) is an "assertion"
        // It checks if the result is what you expect.
        expect(isValidEmail('test@example.com')).toBe(true);
        expect(isValidEmail('user.name+tag@gmail.com')).toBe(true);
    });

    test('should return false for an invalid email', () => {
        expect(isValidEmail('not-an-email')).toBe(false);
        expect(isValidEmail('test@domain')).toBe(false);
        expect(isValidEmail('@example.com')).toBe(false);
    });
});