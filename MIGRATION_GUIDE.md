# GeoTime Migration Guide: Supabase Removal & Secure API Key Management

## Overview

This migration removes Supabase dependency and implements a secure, environment-based API key management system with support for multiple LLM providers.

## 🔥 Breaking Changes

### 1. **Supabase Removed**
- All Supabase references and dependencies have been removed
- No more external database dependency

### 2. **API Key Management**
- **REMOVED**: Frontend localStorage API key storage
- **NEW**: Server-side environment variable management
- **SECURITY**: No API keys exposed to frontend

### 3. **LLM Provider Support**
- **ENHANCED**: Support for OpenAI, Anthropic Claude, Google Gemini, and Groq
- **NEW**: Runtime provider switching capability
- **NEW**: Abstract provider factory pattern

## 🚀 Migration Steps

### Step 1: Environment Setup

#### Frontend Environment
Create `.env.local` in the root directory:
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_NODE_ENV=development
```

#### Server Environment
Create `server/.env`:
```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your actual API keys:
```env
# Required: Choose your LLM provider
LLM_PROVIDER=openai

# Required: Mapbox tokens
MAPBOX_PUBLIC_TOKEN=pk.your_actual_token_here
MAPBOX_SECRET_TOKEN=sk.your_actual_secret_here

# Required: API key for your chosen provider
OPENAI_API_KEY=sk-your_actual_key_here

# Optional: Configure other providers for switching
ANTHROPIC_API_KEY=sk-ant-your_key_here
GOOGLE_API_KEY=your_google_key_here
GROQ_API_KEY=gsk_your_groq_key_here

# Server configuration
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Step 2: Install Dependencies

No new dependencies required - we've removed Supabase dependency.

```bash
# Root dependencies (unchanged)
npm install

# Server dependencies (unchanged)
cd server && npm install
```

### Step 3: Remove Old Data

If you were using localStorage for API keys:
1. Clear browser localStorage for the application
2. Remove any stored Mapbox tokens from browser

### Step 4: Verify Configuration

#### Test Server
```bash
cd server
npm run dev
```

Check console output for:
- ✅ Configuration validation passed
- ✅ LLM provider loaded
- ✅ Mapbox configuration loaded

#### Test Frontend
```bash
npm run dev
```

Check that:
- ✅ Map loads without API key prompt
- ✅ Summary generation works
- ✅ No console errors about missing API keys

## 🔧 Configuration Options

### LLM Provider Switching

Change provider by updating `server/.env`:
```env
# Switch to Claude
LLM_PROVIDER=anthropic

# Switch to Google Gemini
LLM_PROVIDER=google

# Switch to Groq
LLM_PROVIDER=groq
```

### Runtime Provider Switching

The system now supports runtime provider switching through the API:
```javascript
// Future: API endpoint for switching providers
POST /api/llm/switch-provider
{
  "provider": "anthropic"
}
```

### Security Features

1. **No Frontend API Keys**: All API keys are server-side only
2. **Rate Limiting**: Configurable request limits
3. **CORS Protection**: Restricted origins
4. **Input Validation**: Request body validation
5. **Error Sanitization**: No sensitive data in error responses

## 📁 File Structure Changes

### New Files
```
├── .env.local                    # Frontend environment
├── server/.env.example          # Server environment template  
├── server/.env                  # Server environment (create this)
├── MIGRATION_GUIDE.md           # This guide
└── .env.example                 # Updated main environment template
```

### Removed Files
```
├── api/mapbox/config.js         # ❌ Removed (hardcoded tokens)
├── src/example-env.txt          # ❌ Removed (replaced)
└── server/example-env.txt       # ❌ Removed (replaced)
```

### Modified Files
```
├── server/src/config/config.js       # ✅ Enhanced multi-provider support
├── server/src/services/llmService.js # ✅ Abstract provider pattern
├── server/src/services/mapService.js # ✅ Enhanced security
├── server/src/index.js              # ✅ Enhanced security middleware
├── src/components/Map.tsx           # ✅ Server-based config loading
├── src/components/MapClustering.tsx # ✅ Server-based config loading
├── src/services/SummaryService.ts   # ✅ Enhanced error handling
└── .gitignore                       # ✅ Enhanced environment file protection
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Map Not Loading
```
Error: "Mapbox configuration is not properly set up on the server"
```
**Solution**: Check `MAPBOX_PUBLIC_TOKEN` in `server/.env`

#### 2. Summary Generation Failing
```
Error: "OpenAI API key not configured"
```
**Solution**: 
1. Check `OPENAI_API_KEY` in `server/.env`
2. Verify `LLM_PROVIDER=openai` is set
3. Check API key format starts with `sk-`

#### 3. CORS Errors
```
Error: "CORS policy violation"
```
**Solution**: Add your frontend URL to `ALLOWED_ORIGINS` in `server/.env`

#### 4. Server Configuration Errors
```
Error: "Configuration validation failed"
```
**Solution**: 
1. Check all required environment variables are set
2. Verify API key formats
3. Check server logs for specific validation errors

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This provides:
- Detailed configuration validation
- Request/response logging
- Enhanced error messages

## 🔒 Security Best Practices

### Environment Variables
1. **Never commit `.env` files**
2. **Use different keys for dev/prod**
3. **Regularly rotate API keys**
4. **Monitor API usage**

### Production Deployment
1. **Set `NODE_ENV=production`**
2. **Configure `TRUST_PROXY=true` if behind proxy**
3. **Restrict `ALLOWED_ORIGINS` to your domain**
4. **Use HTTPS only**
5. **Enable rate limiting**

### API Key Management
1. **Store in secure environment variables**
2. **Use least-privilege API keys**
3. **Monitor for unusual usage patterns**
4. **Set up billing alerts**

## 🎯 Next Steps

After migration:

1. **Test all functionality** thoroughly
2. **Configure monitoring** for API usage
3. **Set up alerts** for rate limits
4. **Plan API key rotation** schedule
5. **Document** your chosen provider configuration

## 📞 Support

If you encounter issues:

1. Check server logs for configuration errors
2. Verify all environment variables are set correctly
3. Test API endpoints individually
4. Check network connectivity and CORS settings

The new system provides better security, flexibility, and maintainability while removing external dependencies.