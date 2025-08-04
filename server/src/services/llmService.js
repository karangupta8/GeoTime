import axios from 'axios';
import { config } from '../config/config.js';

// Abstract base class for LLM providers
class LLMProvider {
  constructor(config) {
    this.config = config;
  }

  async generateSummary(title, description) {
    throw new Error('generateSummary method must be implemented by provider');
  }

  validateConfiguration() {
    throw new Error('validateConfiguration method must be implemented by provider');
  }
}

// OpenAI provider implementation
class OpenAIProvider extends LLMProvider {
  validateConfiguration() {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
  }

  async generateSummary(title, description) {
    this.validateConfiguration();

    const response = await axios.post(`${this.config.baseUrl}/chat/completions`, {
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: 'You are a historical expert. Create engaging, accurate, and concise summaries of historical events. Focus on significance, context, and impact. Keep summaries to exactly 100 words or less.'
        },
        {
          role: 'user',
          content: `Summarize this historical event in 100 words or less:\n\nTitle: ${title}\n\nDescription: ${description}`
        }
      ],
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
    }, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI API');
    }

    return {
      summary: response.data.choices[0].message.content,
      provider: 'openai',
      model: this.config.model
    };
  }
}

// Anthropic provider implementation
class AnthropicProvider extends LLMProvider {
  validateConfiguration() {
    if (!this.config.apiKey) {
      throw new Error('Anthropic API key not configured');
    }
  }

  async generateSummary(title, description) {
    this.validateConfiguration();

    const response = await axios.post(`${this.config.baseUrl}/messages`, {
      model: this.config.model,
      max_tokens: this.config.maxTokens,
      messages: [
        {
          role: 'user',
          content: `You are a historical expert. Create engaging, accurate, and concise summaries of historical events. Focus on significance, context, and impact. Keep summaries to exactly 100 words or less.

Summarize this historical event in 100 words or less:

Title: ${title}

Description: ${description}`
        }
      ],
      temperature: this.config.temperature,
    }, {
      headers: {
        'x-api-key': this.config.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
    });

    if (!response.data?.content?.[0]?.text) {
      throw new Error('Invalid response from Anthropic API');
    }

    return {
      summary: response.data.content[0].text,
      provider: 'anthropic',
      model: this.config.model
    };
  }
}

// Google Gemini provider implementation
class GoogleProvider extends LLMProvider {
  validateConfiguration() {
    if (!this.config.apiKey) {
      throw new Error('Google API key not configured');
    }
  }

  async generateSummary(title, description) {
    this.validateConfiguration();

    const prompt = `You are a historical expert. Create engaging, accurate, and concise summaries of historical events. Focus on significance, context, and impact. Keep summaries to exactly 100 words or less.

Summarize this historical event in 100 words or less:

Title: ${title}

Description: ${description}`;

    const response = await axios.post(
      `${this.config.baseUrl}/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxTokens,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Google API');
    }

    return {
      summary: response.data.candidates[0].content.parts[0].text,
      provider: 'google',
      model: this.config.model
    };
  }
}

// Groq provider implementation
class GroqProvider extends LLMProvider {
  validateConfiguration() {
    if (!this.config.apiKey) {
      throw new Error('Groq API key not configured');
    }
  }

  async generateSummary(title, description) {
    this.validateConfiguration();

    const response = await axios.post(`${this.config.baseUrl}/chat/completions`, {
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: 'You are a historical expert. Create engaging, accurate, and concise summaries of historical events. Focus on significance, context, and impact. Keep summaries to exactly 100 words or less.'
        },
        {
          role: 'user',
          content: `Summarize this historical event in 100 words or less:\n\nTitle: ${title}\n\nDescription: ${description}`
        }
      ],
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
    }, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from Groq API');
    }

    return {
      summary: response.data.choices[0].message.content,
      provider: 'groq',
      model: this.config.model
    };
  }
}

// Provider factory
class LLMProviderFactory {
  static createProvider(providerName, providerConfig) {
    switch (providerName.toLowerCase()) {
      case 'openai':
        return new OpenAIProvider(providerConfig);
      case 'anthropic':
        return new AnthropicProvider(providerConfig);
      case 'google':
        return new GoogleProvider(providerConfig);
      case 'groq':
        return new GroqProvider(providerConfig);
      default:
        throw new Error(`Unsupported LLM provider: ${providerName}`);
    }
  }
}

// Main LLM service
class LLMService {
  constructor() {
    this.provider = config.apis.llm.provider;
    this.providerConfig = config.apis.llm[this.provider.toLowerCase()];
    this.llmProvider = LLMProviderFactory.createProvider(this.provider, this.providerConfig);
  }

  async generateSummary(title, description) {
    try {
      console.log(`[LLMService] Generating summary using ${this.provider} for: ${title}`);
      
      const result = await this.llmProvider.generateSummary(title, description);
      
      console.log(`[LLMService] Successfully generated summary using ${this.provider}`);
      return result;
    } catch (error) {
      console.error(`[LLMService] Error generating summary with ${this.provider}:`, error.message);
      
      // Return fallback summary
      return this.generateFallbackSummary(title, description);
    }
  }

  // Fallback summary generator (no API call)
  generateFallbackSummary(title, description) {
    console.log('[LLMService] Using fallback summary generation');
    
    const truncatedDescription = description.length > 100 
      ? description.substring(0, 97) + '...'
      : description;
    
    return {
      summary: truncatedDescription,
      provider: 'fallback',
      model: 'none'
    };
  }

  // Method to change provider at runtime
  switchProvider(newProvider) {
    const newProviderConfig = config.apis.llm[newProvider.toLowerCase()];
    if (!newProviderConfig) {
      throw new Error(`Provider ${newProvider} not configured`);
    }
    
    this.provider = newProvider;
    this.providerConfig = newProviderConfig;
    this.llmProvider = LLMProviderFactory.createProvider(newProvider, newProviderConfig);
    
    console.log(`[LLMService] Switched to provider: ${newProvider}`);
  }

  // Get current provider info
  getProviderInfo() {
    return {
      provider: this.provider,
      model: this.providerConfig.model,
      available: Boolean(this.providerConfig.apiKey)
    };
  }
}

export default LLMService;