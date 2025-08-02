// Simplified config for Vercel deployment

// Helper to get env var or fallback
const getEnv = (key, fallback) => {
  const value = process.env[key];
  return value !== undefined ? value : fallback;
};

export const config = {
  apis: {
    mapbox: {
      publicToken: getEnv('MAPBOX_PUBLIC_TOKEN', 'pk.eyJ1Ijoia2FyYW5ndXB0YTgiLCJhIjoiY21kam8zdm5oMGhoNTJyczU3aGtiZTcwMiJ9.BZfMMtGuqqoXp7PjG4QCmg'),
      secretToken: getEnv('MAPBOX_SECRET_TOKEN', 'sk.your_default_mapbox_secret_token')
    },
    llm: {
      provider: getEnv('LLM_PROVIDER', 'fallback'),
      openai: {
        apiKey: getEnv('OPENAI_API_KEY', 'sk-your_openai_key'),
        model: getEnv('OPENAI_MODEL', 'gpt-4o-mini'),
        maxTokens: parseInt(getEnv('OPENAI_MAX_TOKENS', '150')),
        temperature: parseFloat(getEnv('OPENAI_TEMPERATURE', '0.7'))
      },
      anthropic: {
        apiKey: getEnv('ANTHROPIC_API_KEY', 'sk-ant-your_anthropic_api_key'),
        model: getEnv('ANTHROPIC_MODEL', 'claude-3-haiku-20240307'),
        maxTokens: parseInt(getEnv('ANTHROPIC_MAX_TOKENS', '150')),
        temperature: parseFloat(getEnv('ANTHROPIC_TEMPERATURE', '0.7'))
      }
    }
  },

  environment: getEnv('NODE_ENV', 'production'),
  isDevelopment: getEnv('NODE_ENV', 'production') !== 'production',
  isProduction: getEnv('NODE_ENV', 'production') === 'production'
};

export const validateConfig = () => {
  const errors = [];

  const { mapbox, llm } = config.apis;

  if (!mapbox.publicToken || mapbox.publicToken.includes('your_default_mapbox')) {
    errors.push('Mapbox public token is not properly configured.');
  }

  if (llm.provider === 'openai') {
    if (!llm.openai.apiKey || llm.openai.apiKey.includes('your_openai')) {
      errors.push('OpenAI API key is not properly configured.');
    }
  } else if (llm.provider === 'anthropic') {
    if (!llm.anthropic.apiKey || llm.anthropic.apiKey.includes('your_anthropic')) {
      errors.push('Anthropic API key is not properly configured.');
    }
  }

  if (errors.length > 0) {
    console.warn('[config] Configuration warnings:');
    errors.forEach(error => console.warn(`- ${error}`));
  }

  return errors.length === 0;
};
