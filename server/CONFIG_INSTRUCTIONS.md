# Server Configuration Instructions

This server now handles all API keys and external service configurations. Follow these steps to configure your API keys:

## 1. Configure API Keys

Edit the file `server/src/config/config.js` and replace the placeholder values with your actual API keys:

### Mapbox Configuration
```javascript
mapbox: {
  publicToken: 'pk.your_mapbox_public_token_here',  // Get from https://mapbox.com
  secretToken: 'sk.your_mapbox_secret_token_here'   // Optional
}
```

### LLM Provider Configuration
Choose your preferred LLM provider by setting the `provider` field and adding the corresponding API key:

#### For OpenAI:
```javascript
llm: {
  provider: 'openai',
  openai: {
    apiKey: 'sk-your_openai_api_key_here',  // Get from https://openai.com
    model: 'gpt-4o-mini',
    maxTokens: 150,
    temperature: 0.7
  }
}
```

#### For Anthropic (Claude):
```javascript
llm: {
  provider: 'anthropic',
  anthropic: {
    apiKey: 'sk-ant-your_anthropic_api_key_here',  // Get from https://console.anthropic.com
    model: 'claude-3-haiku-20240307',
    maxTokens: 150,
    temperature: 0.7
  }
}
```

## 2. Switch LLM Providers

To switch between LLM providers, simply change the `provider` field in the config:

```javascript
llm: {
  provider: 'openai',    // Change to 'anthropic' to use Claude instead
  // ... rest of config
}
```

## 3. Start the Server

1. Navigate to the server directory: `cd server`
2. Install dependencies: `npm install`
3. Start the server: `npm run dev`

The server will validate your configuration on startup and warn you about any missing API keys.

## 4. API Endpoints

Once configured, the following endpoints will be available:

- `GET /api/events` - Historical events data
- `GET /api/mapbox/config` - Mapbox configuration for frontend
- `POST /api/summarize` - Generate AI summaries for historical events

## 5. Frontend Integration

The frontend automatically calls these server endpoints and no longer requires API keys to be entered by users. All API key management is handled server-side for security.

## Security Notes

- API keys are stored server-side only and never exposed to the frontend
- No .env files are used - all configuration is in `config.js`
- The server validates configuration on startup
- Rate limiting is applied to all endpoints

## Troubleshooting

1. **Map not loading**: Check your Mapbox public token in `config.js`
2. **AI summaries not working**: Verify your LLM provider API key and ensure the provider is set correctly
3. **Server won't start**: Check the console for configuration validation errors

For additional help, check the server logs when starting the application.