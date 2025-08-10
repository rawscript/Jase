// Environment configuration
const config = {
  // API base URL - will be different for development vs production
  // Remove trailing slash to prevent double slashes
  apiUrl: (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, ''),
  
  // Other environment variables can go here
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export default config;