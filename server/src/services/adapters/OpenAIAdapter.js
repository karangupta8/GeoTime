import axios from 'axios';

class OpenAIAdapter {
  constructor(config) {
    this.config = config;
    this.apiKey = process.env.OPENAI_API_KEY;
  }

  isConfigured() {
    return !!this.apiKey;
  }

  getModel() {
    return process.env.OPENAI_MODEL || this.config.defaultModel;
  }

  async generateSummary(title, description) {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Please provide a concise, informative summary of this historical event in 2-3 sentences:

Title: ${title}
Description: ${description}

Focus on the key facts, significance, and impact. Keep it engaging but factual.`;

    const response = await axios.post(
      this.config.endpoint,
      {
        model: this.getModel(),
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      },
      {
        headers: {
          [this.config.authHeader]: `${this.config.authPrefix} ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const summary = response.data.choices[0]?.message?.content?.trim();

    if (!summary) {
      throw new Error('No summary generated');
    }

    return {
      summary,
      source: 'openai',
      model: this.getModel()
    };
  }
}

export default OpenAIAdapter;