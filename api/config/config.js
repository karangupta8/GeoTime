export const config = {
  apis: {
    mapbox: {
      publicToken: typeof process.env.MAPBOX_PUBLIC_TOKEN === 'string'
        ? process.env.MAPBOX_PUBLIC_TOKEN
        : 'pk.your_default_mapbox_token',
      secretToken: typeof process.env.MAPBOX_SECRET_TOKEN === 'string'
        ? process.env.MAPBOX_SECRET_TOKEN
        : 'sk.your_default_mapbox_secret_token'
    },
    llm: {
      provider: typeof process.env.LLM_PROVIDER === 'string'
        ? process.env.LLM_PROVIDER
        : 'fallback',
      openai: {
        apiKey: typeof process.env.OPENAI_API_KEY === 'string'
          ? process.env.OPENAI_API_KEY
          : 'sk-your_openai_key',
        model: typeof process.env.OPENAI_MODEL === 'string'
          ? process.env.OPENAI_MODEL
          : 'gpt-4o-mini',
        maxTokens: typeof process.env.OPENAI_MAX_TOKENS === 'string'
          ? parseInt(process.env.OPENAI_MAX_TOKENS, 10)
          : 150,
        temperature: typeof process.env.OPENAI_TEMPERATURE === 'string'
          ? parseFloat(process.env.OPENAI_TEMPERATURE)
          : 0.7
      },
      anthropic: {
        apiKey: typeof process.env.ANTHROPIC_API_KEY === 'string'
          ? process.env.ANTHROPIC_API_KEY
          : 'sk-ant-your_anthropic_api_key',
        model: typeof process.env.ANTHROPIC_MODEL === 'string'
          ? process.env.ANTHROPIC_MODEL
          : 'claude-3-haiku-20240307',
        maxTokens: typeof process.env.ANTHROPIC_MAX_TOKENS === 'string'
          ? parseInt(process.env.ANTHROPIC_MAX_TOKENS, 10)
          : 150,
        temperature: typeof process.env.ANTHROPIC_TEMPERATURE === 'string'
          ? parseFloat(process.env.ANTHROPIC_TEMPERATURE)
          : 0.7
      }
    }
  },

  environment: typeof process.env.NODE_ENV === 'string'
    ? process.env.NODE_ENV
    : 'production',

  isDevelopment: typeof process.env.NODE_ENV === 'string'
    ? process.env.NODE_ENV !== 'production'
    : false,

  isProduction: typeof process.env.NODE_ENV === 'string'
    ? process.env.NODE_ENV === 'production'
    : true
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
