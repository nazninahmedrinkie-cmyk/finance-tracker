import '@testing-library/jest-dom';

// Mock IntersectionObserver 
class IntersectionObserver {
  constructor() {}

  observe() {
    return null;
  }

  unobserve() {
    return null;
  }

  disconnect() {
    return null;
  }
}

global.IntersectionObserver = IntersectionObserver;