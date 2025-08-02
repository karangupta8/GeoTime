// Pull environment values first at the top-level
const MAPBOX_PUBLIC_TOKEN = process.env.MAPBOX_PUBLIC_TOKEN;
const MAPBOX_SECRET_TOKEN = process.env.MAPBOX_SECRET_TOKEN;

const LLM_PROVIDER = process.env.LLM_PROVIDER;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL;
const OPENAI_MAX_TOKENS = process.env.OPENAI_MAX_TOKENS;
const OPENAI_TEMPERATURE = process.env.OPENAI_TEMPERATURE;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL;
const ANTHROPIC_MAX_TOKENS = process.env.ANTHROPIC_MAX_TOKENS;
const ANTHROPIC_TEMPERATURE = process.env.ANTHROPIC_TEMPERATURE;

const NODE_ENV = process.env.NODE_ENV;

export const config = {
  apis: {
    mapbox: {
      publicToken: MAPBOX_PUBLIC_TOKEN ? MAPBOX_PUBLIC_TOKEN : 'pk.your_default_mapbox_token',
      secretToken: MAPBOX_SECRET_TOKEN ? MAPBOX_SECRET_TOKEN : 'sk.your_default_secret'
    },
    llm: {
      provider: LLM_PROVIDER || 'fallback',
      openai: {
        apiKey: OPENAI_API_KEY || 'sk-your_openai_key',
        model: OPENAI_MODEL || 'gpt-4o-mini',
        maxTokens: parseInt(OPENAI_MAX_TOKENS || '150'),
        temperature: parseFloat(OPENAI_TEMPERATURE || '0.7')
      },
      anthropic: {
        apiKey: ANTHROPIC_API_KEY || 'sk-ant-your_anthropic_api_key',
        model: ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
        maxTokens: parseInt(ANTHROPIC_MAX_TOKENS || '150'),
        temperature: parseFloat(ANTHROPIC_TEMPERATURE || '0.7')
      }
    }
  },

  environment: NODE_ENV || 'production',
  isDevelopment: (NODE_ENV || 'production') !== 'production',
  isProduction: (NODE_ENV || 'production') === 'production'
};
