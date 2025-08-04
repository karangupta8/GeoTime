// server/src/config/config.js

import dotenv from 'dotenv';

// Try loading .env file
try {
  dotenv.config();
  console.log('[config] .env file loaded');
} catch (err) {
  console.warn('[config] Failed to load .env file. Falling back to default values.');
}

// Helper to get env var or fallback
const getEnv = (key, fallback) => process.env[key] || fallback;

export const config = {
  apis: {
    mapbox: {
      publicToken: getEnv('MAPBOX_PUBLIC_TOKEN', 'pk.eyJ1Ijoia2FyYW5ndXB0YTgiLCJhIjoiY21kam8zdm5oMGhoNTJyczU3aGtiZTcwMiJ9.BZfMMtGuqqoXp7PjG4QCmg'),
      secretToken: getEnv('MAPBOX_SECRET_TOKEN', 'sk.eyJ1Ijoia2FyYW5ndXB0YTgiLCJhIjoiY21kam8zdm5oMGhoNTJyczU3aGtiZTcwMiJ9.BZfMMtGuqqoXp7PjG4QCmg')
    },
    llm: {
      provider: getEnv('LLM_PROVIDER', 'openai'), // openai | anthropic | google | groq
      openai: {
        apiKey: getEnv('OPENAI_API_KEY', 'pk.eyJ1Ijoia2FyYW5ndXB0YTgiLCJhIjoiY21kam8zdm5oMGhoNTJyczU3aGtiZTcwMiJ9.BZfMMtGuqqoXp7PjG4QCmg'),
        model: getEnv('OPENAI_MODEL', 'gpt-4o-mini'),
        maxTokens: parseInt(getEnv('OPENAI_MAX_TOKENS', '150')),
        temperature: parseFloat(getEnv('OPENAI_TEMPERATURE', '0.7')),
        baseUrl: getEnv('OPENAI_BASE_URL', 'https://api.openai.com/v1')
      },
      anthropic: {
        apiKey: getEnv('ANTHROPIC_API_KEY', ''),
        model: getEnv('ANTHROPIC_MODEL', 'claude-3-haiku-20240307'),
        maxTokens: parseInt(getEnv('ANTHROPIC_MAX_TOKENS', '150')),
        temperature: parseFloat(getEnv('ANTHROPIC_TEMPERATURE', '0.7')),
        baseUrl: getEnv('ANTHROPIC_BASE_URL', 'https://api.anthropic.com/v1')
      },
      google: {
        apiKey: getEnv('GOOGLE_API_KEY', ''),
        model: getEnv('GOOGLE_MODEL', 'gemini-1.5-flash'),
        maxTokens: parseInt(getEnv('GOOGLE_MAX_TOKENS', '150')),
        temperature: parseFloat(getEnv('GOOGLE_TEMPERATURE', '0.7')),
        baseUrl: getEnv('GOOGLE_BASE_URL', 'https://generativelanguage.googleapis.com/v1')
      },
      groq: {
        apiKey: getEnv('GROQ_API_KEY', ''),
        model: getEnv('GROQ_MODEL', 'llama3-8b-8192'),
        maxTokens: parseInt(getEnv('GROQ_MAX_TOKENS', '150')),
        temperature: parseFloat(getEnv('GROQ_TEMPERATURE', '0.7')),
        baseUrl: getEnv('GROQ_BASE_URL', 'https://api.groq.com/openai/v1')
      }
    }
  },

  server: {
    port: parseInt(getEnv('PORT', '3001')),
    cors: {
      origins: getEnv('ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,https://geo-time.vercel.app').split(','),
      credentials: true
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: parseInt(getEnv('RATE_LIMIT_MAX', '100')),
      standardHeaders: true,
      legacyHeaders: false
    },
    security: {
      trustProxy: getEnv('TRUST_PROXY', 'false') === 'true',
      maxRequestSize: getEnv('MAX_REQUEST_SIZE', '1mb')
    }
  },

  environment: getEnv('NODE_ENV', 'development'),
  isDevelopment: getEnv('NODE_ENV', 'development') !== 'production',
  isProduction: getEnv('NODE_ENV', 'development') === 'production'
};

export const validateConfig = () => {
  const errors = [];
  const warnings = [];

  const { mapbox, llm } = config.apis;

  // Validate Mapbox configuration
  if (!mapbox.publicToken) {
    errors.push('MAPBOX_PUBLIC_TOKEN is required for map functionality.');
  }

  // Validate LLM configuration based on provider
  const provider = llm.provider.toLowerCase();
  
  switch (provider) {
    case 'openai':
      if (!llm.openai.apiKey) {
        errors.push('OPENAI_API_KEY is required when using OpenAI provider.');
      }
      break;
    case 'anthropic':
      if (!llm.anthropic.apiKey) {
        errors.push('ANTHROPIC_API_KEY is required when using Anthropic provider.');
      }
      break;
    case 'google':
      if (!llm.google.apiKey) {
        errors.push('GOOGLE_API_KEY is required when using Google provider.');
      }
      break;
    case 'groq':
      if (!llm.groq.apiKey) {
        errors.push('GROQ_API_KEY is required when using Groq provider.');
      }
      break;
    default:
      errors.push(`Unsupported LLM provider: ${provider}. Supported providers: openai, anthropic, google, groq`);
  }

  // Security warnings
  if (config.isDevelopment && config.server.cors.origins.includes('*')) {
    warnings.push('CORS is configured to allow all origins. This should be restricted in production.');
  }

  if (errors.length > 0) {
    console.error('[config] Configuration errors:');
    errors.forEach(error => console.error(`- ${error}`));
    return false;
  }

  if (warnings.length > 0) {
    console.warn('[config] Configuration warnings:');
    warnings.forEach(warning => console.warn(`- ${warning}`));
  }

  return true;
};
