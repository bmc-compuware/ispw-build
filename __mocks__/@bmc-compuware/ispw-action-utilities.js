/**
 * Mock for @bmc-compuware/ispw-action-utilities
 * This mock is needed because the package has dependencies that use ES modules
 * which Jest cannot parse by default
 */

module.exports = {
  retrieveInputs: jest.fn((core, keys) => {
    const inputs = {};
    keys.forEach(key => {
      inputs[key] = '';
    });
    return inputs;
  }),
  
  convertObjectToJson: jest.fn((obj) => {
    return JSON.stringify(obj);
  }),
  
  stringHasContent: jest.fn((str) => {
    if (typeof str === 'string') {
      return str.trim() !== '';
    }
    if (Array.isArray(str)) {
      return str.length > 0;
    }
    return str !== undefined && str !== null;
  }),
  
  parseStringAsJson: jest.fn((str) => {
    return JSON.parse(str);
  }),
  
  assembleRequestUrl: jest.fn((baseUrl, path) => {
    return new URL(path, baseUrl);
  }),
  
  sendHttpRequest: jest.fn(() => {
    return Promise.resolve({ statusCode: 200, body: {} });
  }),
  
  pollTaskStatus: jest.fn(() => {
    return Promise.resolve({ statusCode: 200, body: {} });
  }),
  
  validateRequiredFields: jest.fn(() => {
    return true;
  }),
  
  getStatusMessageToPrint: jest.fn((statusMsg) => {
    return statusMsg || '';
  })
};
