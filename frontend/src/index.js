import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store';
import { checkAuthStatus } from './store/slices/authSlice';
import App from './App';
import { suppressResizeObserverErrors } from './utils/errorHandlers';
import './utils/axiosConfig'; // Import axios configuration
import './index.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Suppress ResizeObserver errors globally
suppressResizeObserverErrors();

// Check authentication status on app startup
const token = localStorage.getItem('token');
if (token) {
  store.dispatch(checkAuthStatus());
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
