import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAIAdapter from './adapters/OpenAIAdapter.js';
import ClaudeAdapter from './adapters/ClaudeAdapter.js';
import GeminiAdapter from './adapters/GeminiAdapter.js';
import OllamaAdapter from './adapters/OllamaAdapter.js';
import HuggingFaceAdapter from './adapters/HuggingFaceAdapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LLMAdapter {
  constructor() {
    this.config = this.loadConfig();
    this.provider = process.env.LLM_PROVIDER || 'openai';
    this.adapter = this.createAdapter();
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, '../../config/llm-providers.json');
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      console.error('Error loading LLM config:', error);
      return { providers: {} };
    }
  }

  createAdapter() {
    const providerConfig = this.config.providers[this.provider];
    
    if (!providerConfig) {
      console.warn(`Provider '${this.provider}' not found in config, falling back to OpenAI`);
      return new OpenAIAdapter(this.config.providers.openai);
    }

    switch (this.provider) {
      case 'openai':
        return new OpenAIAdapter(providerConfig);
      case 'claude':
        return new ClaudeAdapter(providerConfig);
      case 'gemini':
        return new GeminiAdapter(providerConfig);
      case 'ollama':
        return new OllamaAdapter(providerConfig);
      case 'huggingface':
        return new HuggingFaceAdapter(providerConfig);
      default:
        console.warn(`Unknown provider '${this.provider}', falling back to OpenAI`);
        return new OpenAIAdapter(this.config.providers.openai);
    }
  }

  async generateSummary(title, description) {
    try {
      return await this.adapter.generateSummary(title, description);
    } catch (error) {
      console.error(`Error with ${this.provider} provider:`, error);
      
      // Fallback summary
      return {
        summary: `${description.substring(0, 150)}...`,
        source: 'fallback',
        error: `${this.provider} summarization unavailable`
      };
    }
  }

  getProviderInfo() {
    return {
      provider: this.provider,
      model: this.adapter.getModel(),
      available: this.adapter.isConfigured()
    };
  }
}

export default LLMAdapter;