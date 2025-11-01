// Import the function to test
const { isValidEmail } = require('../../src/utils/validators');

// 'describe' groups related tests
describe('Validation Utils', () => {

  // 'test' or 'it' defines a single test case
  test('isValidEmail should return true for valid emails', () => {
    // 'expect' is your assertion
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co')).toBe(true);
  });

  test('isValidEmail should return false for invalid emails', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('test@domain')).toBe(false);
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(123)).toBe(false);
  });
});