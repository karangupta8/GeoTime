export const config = {
  apis: {
    mapbox: {
      publicToken: process.env.MAPBOX_PUBLIC_TOKEN,
      secretToken: process.env.MAPBOX_SECRET_TOKEN
    },
    llm: {
      provider: process.env.LLM_PROVIDER || 'openai',
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '150'),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7')
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
        maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '150'),
        temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || '0.7')
      }
    }
  },

  environment: process.env.NODE_ENV || 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production'
};
