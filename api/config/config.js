// config.js – Safe for Vercel builds

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

// Fallback defaults (hardcoded)
const defaultMapboxPublic = 'pk.eyJ1Ijoia2FyYW5ndXB0YTgiLCJhIjoiY21kam8zdm5oMGhoNTJyczU3aGtiZTcwMiJ9.BZfMMtGuqqoXp7PjG4QCmg';
const defaultMapboxSecret = 'sk.your_default_mapbox_secret_token';

const defaultLLMProvider = 'fallback';

const defaultOpenAIKey = 'sk-your_openai_key';
const defaultOpenAIModel = 'gpt-4o-mini';
const defaultOpenAIMaxTokens = '150';
const defaultOpenAITemperature = '0.7';

const defaultAnthropicKey = 'sk-ant-your_anthropic_api_key';
const defaultAnthropicModel = 'claude-3-haiku-20240307';
const defaultAnthropicMaxTokens = '150';
const defaultAnthropicTemperature = '0.7';

const defaultNodeEnv = 'production';

// Safe assignments
let publicToken = defaultMapboxPublic;
if (MAPBOX_PUBLIC_TOKEN) {
  publicToken = MAPBOX_PUBLIC_TOKEN;
}

let secretToken = defaultMapboxSecret;
if (MAPBOX_SECRET_TOKEN) {
  secretToken = MAPBOX_SECRET_TOKEN;
}

let provider = defaultLLMProvider;
if (LLM_PROVIDER) {
  provider = LLM_PROVIDER;
}

let openaiApiKey = defaultOpenAIKey;
if (OPENAI_API_KEY) {
  openaiApiKey = OPENAI_API_KEY;
}

let openaiModel = defaultOpenAIModel;
if (OPENAI_MODEL) {
  openaiModel = OPENAI_MODEL;
}

let openaiMaxTokens = parseInt(defaultOpenAIMaxTokens);
if (OPENAI_MAX_TOKENS) {
  openaiMaxTokens = parseInt(OPENAI_MAX_TOKENS);
}

let openaiTemperature = parseFloat(defaultOpenAITemperature);
if (OPENAI_TEMPERATURE) {
  openaiTemperature = parseFloat(OPENAI_TEMPERATURE);
}

let anthropicApiKey = defaultAnthropicKey;
if (ANTHROPIC_API_KEY) {
  anthropicApiKey = ANTHROPIC_API_KEY;
}

let anthropicModel = defaultAnthropicModel;
if (ANTHROPIC_MODEL) {
  anthropicModel = ANTHROPIC_MODEL;
}

let anthropicMaxTokens = parseInt(defaultAnthropicMaxTokens);
if (ANTHROPIC_MAX_TOKENS) {
  anthropicMaxTokens = parseInt(ANTHROPIC_MAX_TOKENS);
}

let anthropicTemperature = parseFloat(defaultAnthropicTemperature);
if (ANTHROPIC_TEMPERATURE) {
  anthropicTemperature = parseFloat(ANTHROPIC_TEMPERATURE);
}

let environment = defaultNodeEnv;
if (NODE_ENV) {
  environment = NODE_ENV;
}

const isDevelopment = environment !== 'production';
const isProduction = environment === 'production';

export const config = {
  apis: {
    mapbox: {
      publicToken,
      secretToken
    },
    llm: {
      provider,
      openai: {
        apiKey: openaiApiKey,
        model: openaiModel,
        maxTokens: openaiMaxTokens,
        temperature: openaiTemperature
      },
      anthropic: {
        apiKey: anthropicApiKey,
        model: anthropicModel,
        maxTokens: anthropicMaxTokens,
        temperature: anthropicTemperature
      }
    }
  },
  environment,
  isDevelopment,
  isProduction
};

export const validateConfig = () => {
  const errors = [];

  if (!publicToken || publicToken.includes('your_default_mapbox')) {
    errors.push('Mapbox public token is not properly configured.');
  }

  if (provider === 'openai' && (!openaiApiKey || openaiApiKey.includes('your_openai'))) {
    errors.push('OpenAI API key is not properly configured.');
  }

  if (provider === 'anthropic' && (!anthropicApiKey || anthropicApiKey.includes('your_anthropic'))) {
    errors.push('Anthropic API key is not properly configured.');
  }

  if (errors.length > 0) {
    console.warn('[config] Configuration warnings:');
    errors.forEach(err => console.warn('- ' + err));
  }

  return errors.length === 0;
};
