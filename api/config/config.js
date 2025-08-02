export const config = {
  apis: {
    mapbox: {
      publicToken: process.env.MAPBOX_PUBLIC_TOKEN || 'pk.your_default_mapbox_token',
      secretToken: process.env.MAPBOX_SECRET_TOKEN || 'sk.your_default_mapbox_secret_token'
    },
    llm: {
      provider: process.env.LLM_PROVIDER || 'fallback',
      openai: {
        apiKey: process.env.OPENAI_API_KEY || 'sk-your_openai_key',
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '150'),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7')
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY || 'sk-ant-your_anthropic_api_key',
        model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
        maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '150'),
        temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || '0.7')
      }
    }
  },
  environment: process.env.NODE_ENV || 'production',
  isDevelopment: (process.env.NODE_ENV || 'production') !== 'production',
  isProduction: (process.env.NODE_ENV || 'production') === 'production'
};

export const validateConfig = () => {
  const errors = [];
  const cfg = config.apis;

  if (!cfg.mapbox.publicToken || cfg.mapbox.publicToken.includes('your_default_mapbox')) {
    errors.push('Mapbox public token is not properly configured.');
  }

  if (cfg.llm.provider === 'openai' && (!cfg.llm.openai.apiKey || cfg.llm.openai.apiKey.includes('your_openai'))) {
    errors.push('OpenAI API key is not properly configured.');
  }

  if (cfg.llm.provider === 'anthropic' && (!cfg.llm.anthropic.apiKey || cfg.llm.anthropic.apiKey.includes('your_anthropic'))) {
    errors.push('Anthropic API key is not properly configured.');
  }

  if (errors.length > 0) {
    console.warn('[config] Configuration warnings:');
    errors.forEach(err => console.warn('- ' + err));
  }

  return errors.length === 0;
};
