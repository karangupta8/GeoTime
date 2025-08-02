// Centralized configuration for all API keys and settings
// Change these values to configure your API keys and providers

export const config = {
  // API Keys Configuration
  apis: {
    mapbox: {
      publicToken: 'pk.eyJ1Ijoia2FyYW5ndXB0YTgiLCJhIjoiY21kam8zdm5oMGhoNTJyczU3aGtiZTcwMiJ9.BZfMMtGuqqoXp7PjG4QCmg',
      secretToken: 'sk.your_mapbox_secret_token_here' // Optional for advanced features
    },
    llm: {
      provider: 'openai', // 'openai' | 'anthropic' | 'local'
      openai: {
        apiKey: 'pk.eyJ1Ijoia2FyYW5ndXB0YTgiLCJhIjoiY21kam8zdm5oMGhoNTJyczU3aGtiZTcwMiJ9.BZfMMtGuqqoXp7PjG4QCmg',
        model: 'gpt-4o-mini',
        maxTokens: 150,
        temperature: 0.7
      },
      anthropic: {
        apiKey: 'sk-ant-your_anthropic_api_key_here',
        model: 'claude-3-haiku-20240307',
        maxTokens: 150,
        temperature: 0.7
      }
    }
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 3001,
    cors: {
      origins: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:8080'],
      credentials: true
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // requests per window
    }
  },

  // Environment Detection
  environment: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production'
};

// Validation helper
export const validateConfig = () => {
  const errors = [];

  // Check Mapbox token
  if (!config.apis.mapbox.publicToken || config.apis.mapbox.publicToken.includes('your_mapbox')) {
    errors.push('Mapbox public token not configured in config.js');
  }

  // Check LLM configuration
  const provider = config.apis.llm.provider;
  if (provider === 'openai') {
    if (!config.apis.llm.openai.apiKey || config.apis.llm.openai.apiKey.includes('your_openai')) {
      errors.push('OpenAI API key not configured in config.js');
    }
  } else if (provider === 'anthropic') {
    if (!config.apis.llm.anthropic.apiKey || config.apis.llm.anthropic.apiKey.includes('your_anthropic')) {
      errors.push('Anthropic API key not configured in config.js');
    }
  }

  if (errors.length > 0) {
    console.warn('Configuration warnings:');
    errors.forEach(error => console.warn(`- ${error}`));
  }

  return errors.length === 0;
};