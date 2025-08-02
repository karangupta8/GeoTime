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

// Define fallback values **before** using them
const fallbackMapboxPublicToken = 'pk.your_default_mapbox_token';
const fallbackMapboxSecretToken = 'sk.your_default_secret';
const fallbackLLMProvider = 'fallback';

const fallbackOpenAI = {
  apiKey: 'sk-your_openai_key',
  model: 'gpt-4o-mini',
  maxTokens: 150,
  temperature: 0.7
};

const fallbackAnthropic = {
  apiKey: 'sk-ant-your_anthropic_api_key',
  model: 'claude-3-haiku-20240307',
  maxTokens: 150,
  temperature: 0.7
};

export const config = {
  apis: {
    mapbox: {
      publicToken: typeof MAPBOX_PUBLIC_TOKEN === 'string' ? MAPBOX_PUBLIC_TOKEN : fallbackMapboxPublicToken,
      secretToken: typeof MAPBOX_SECRET_TOKEN === 'string' ? MAPBOX_SECRET_TOKEN : fallbackMapboxSecretToken
    },
    llm: {
      provider: typeof LLM_PROVIDER === 'string' ? LLM_PROVIDER : fallbackLLMProvider,
      openai: {
        apiKey: typeof OPENAI_API_KEY === 'string' ? OPENAI_API_KEY : fallbackOpenAI.apiKey,
        model: typeof OPENAI_MODEL === 'string' ? OPENAI_MODEL : fallbackOpenAI.model,
        maxTokens: typeof OPENAI_MAX_TOKENS === 'string' ? parseInt(OPENAI_MAX_TOKENS) : fallbackOpenAI.maxTokens,
        temperature: typeof OPENAI_TEMPERATURE === 'string' ? parseFloat(OPENAI_TEMPERATURE) : fallbackOpenAI.temperature
      },
      anthropic: {
        apiKey: typeof ANTHROPIC_API_KEY === 'string' ? ANTHROPIC_API_KEY : fallbackAnthropic.apiKey,
        model: typeof ANTHROPIC_MODEL === 'string' ? ANTHROPIC_MODEL : fallbackAnthropic.model,
        maxTokens: typeof ANTHROPIC_MAX_TOKENS === 'string' ? parseInt(ANTHROPIC_MAX_TOKENS) : fallbackAnthropic.maxTokens,
        temperature: typeof ANTHROPIC_TEMPERATURE === 'string' ? parseFloat(ANTHROPIC_TEMPERATURE) : fallbackAnthropic.temperature
      }
    }
  },

  environment: typeof NODE_ENV === 'string' ? NODE_ENV : 'production',
  isDevelopment: NODE_ENV !== 'production',
  isProduction: NODE_ENV === 'production'
};
