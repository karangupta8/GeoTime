// Completely static configuration - no dynamic expressions

export const config = {
  apis: {
    mapbox: {
      publicToken: 'pk.eyJ1Ijoia2FyYW5ndXB0YTgiLCJhIjoiY21kam8zdm5oMGhoNTJyczU3aGtiZTcwMiJ9.BZfMMtGuqqoXp7PjG4QCmg',
      secretToken: 'sk.your_default_mapbox_secret_token'
    },
    llm: {
      provider: 'fallback',
      openai: {
        apiKey: 'sk-your_openai_key',
        model: 'gpt-4o-mini',
        maxTokens: 150,
        temperature: 0.7
      },
      anthropic: {
        apiKey: 'sk-ant-your_anthropic_api_key',
        model: 'claude-3-haiku-20240307',
        maxTokens: 150,
        temperature: 0.7
      }
    }
  },

  environment: 'production',
  isDevelopment: false,
  isProduction: true
};

export const validateConfig = () => {
  return true;
};
