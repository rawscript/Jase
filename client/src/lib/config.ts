// Environment configuration
const config = {
  // API base URL - will be different for development vs production
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  
  // Other environment variables can go here
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export default config;