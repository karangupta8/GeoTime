// API configuration for different environments
export const API_CONFIG = {
  // In development, use the proxy (relative URL)
  // In production, use the deployed API URL
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  
  // API endpoints
  endpoints: {
    events: '/events',
    mapbox: {
      config: '/mapbox/config',
    },
    summarize: '/summarize',
    health: '/health',
  },
  
  // Helper function to get full API URL
  getUrl: (endpoint: string) => {
    const base = API_CONFIG.baseUrl.replace(/\/+$/, '');
    const path = endpoint.replace(/^\/+/, '');
    return `${base}/${path}`;
  }
};

export default API_CONFIG;