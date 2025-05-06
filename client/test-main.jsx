import React from 'react';
import { createRoot } from 'react-dom/client';
import TestApp from './src/TestApp';
import './src/index.css';

// Basic React rendering with explicit JSX pragma to avoid potential transform issues
console.log('Test main.jsx - React version:', React.version);

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(React.createElement(TestApp));
  console.log('React render attempted');
} else {
  console.error('Root element not found');
}