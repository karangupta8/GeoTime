import axios from 'axios';
import { config } from '../config/config.js';

class LLMService {
  constructor() {
    this.provider = config.apis.llm.provider;
    this.validateConfiguration();
  }

  validateConfiguration() {
    const provider = this.provider;
    if (provider === 'fallback') {
      // Fallback mode doesn't require API keys
      return;
    } else if (provider === 'openai') {
      if (!config.apis.llm.openai.apiKey || config.apis.llm.openai.apiKey.includes('your_openai')) {
        throw new Error('OpenAI API key not configured in config.js');
      }
    } else if (provider === 'anthropic') {
      if (!config.apis.llm.anthropic.apiKey || config.apis.llm.anthropic.apiKey.includes('your_anthropic')) {
        throw new Error('Anthropic API key not configured in config.js');
      }
    } else {
      throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }

  async generateSummary(title, description) {
    try {
      console.log(`Generating summary using ${this.provider} for: ${title}`);
      
      switch (this.provider) {
        case 'fallback':
          return this.generateFallbackSummary(title, description);
        case 'openai':
          return await this.generateOpenAISummary(title, description);
        case 'anthropic':
          return await this.generateAnthropicSummary(title, description);
        default:
          throw new Error(`Unsupported provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Error generating LLM summary:', error);
      throw error;
    }
  }

  async generateOpenAISummary(title, description) {
    const openaiConfig = config.apis.llm.openai;
    
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: openaiConfig.model,
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
      max_tokens: openaiConfig.maxTokens,
      temperature: openaiConfig.temperature,
    }, {
      headers: {
        'Authorization': `Bearer ${openaiConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error('Invalid response from OpenAI API');
    }

    return {
      summary: response.data.choices[0].message.content || 'Unable to generate summary',
      provider: 'openai',
      model: openaiConfig.model
    };
  }

  async generateAnthropicSummary(title, description) {
    const anthropicConfig = config.apis.llm.anthropic;
    
    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: anthropicConfig.model,
      max_tokens: anthropicConfig.maxTokens,
      messages: [
        {
          role: 'user',
          content: `You are a historical expert. Create engaging, accurate, and concise summaries of historical events. Focus on significance, context, and impact. Keep summaries to exactly 100 words or less.

Summarize this historical event in 100 words or less:

Title: ${title}

Description: ${description}`
        }
      ],
      temperature: anthropicConfig.temperature,
    }, {
      headers: {
        'x-api-key': anthropicConfig.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
    });

    if (!response.data || !response.data.content || !response.data.content[0]) {
      throw new Error('Invalid response from Anthropic API');
    }

    return {
      summary: response.data.content[0].text || 'Unable to generate summary',
      provider: 'anthropic',
      model: anthropicConfig.model
    };
  }

  // Fallback summary generator (no API call)
  generateFallbackSummary(title, description) {
    const truncatedDescription = description.length > 100 
      ? description.substring(0, 97) + '...'
      : description;
    
    return {
      summary: truncatedDescription,
      provider: 'fallback',
      model: 'none'
    };
  }
}

export default LLMService;