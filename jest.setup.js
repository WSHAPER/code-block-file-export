// jest.setup.js
// Setup global mocks for DOM elements that JSDOM might not implement
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();

// Mock document.body.appendChild and removeChild
document.body.appendChild = jest.fn();
document.body.removeChild = jest.fn();

// Any other global setup needed for tests
