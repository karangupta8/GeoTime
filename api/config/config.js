// server/src/config/config.js

const config = {
  apis: {
    mapbox: {
      publicToken: process.env.MAPBOX_PUBLIC_TOKEN || 'pk.fallback_token',
      secretToken: process.env.MAPBOX_SECRET_TOKEN || 'sk.fallback_token'
    },
    llm: {
      provider: process.env.LLM_PROVIDER || 'openai',
      openai: {
        apiKey: process.env.OPENAI_API_KEY || 'sk-fallback',
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '150', 10),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7')
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
        maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '150', 10),
        temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || '0.7')
      }
    }
  },

  environment: process.env.NODE_ENV || 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production'
};

function validateConfig() {
  const errors = [];

  const { mapbox, llm } = config.apis;

  if (!mapbox.publicToken) {
    errors.push('Mapbox public token is not configured.');
  }

  if (llm.provider === 'openai') {
    if (!llm.openai.apiKey) {
      errors.push('OpenAI API key is not configured.');
    }
  } else if (llm.provider === 'anthropic') {
    if (!llm.anthropic.apiKey) {
      errors.push('Anthropic API key is not configured.');
    }
  }

  if (errors.length > 0) {
    console.warn('[config] Configuration warnings:');
    errors.forEach(error => console.warn(`- ${error}`));
  }

  return errors.length === 0;
}

module.exports = {
  config,
  validateConfig
};
