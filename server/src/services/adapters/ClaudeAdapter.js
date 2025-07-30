import axios from 'axios';

class ClaudeAdapter {
  constructor(config) {
    this.config = config;
    this.apiKey = process.env.CLAUDE_API_KEY;
  }

  isConfigured() {
    return !!this.apiKey;
  }

  getModel() {
    return process.env.CLAUDE_MODEL || this.config.defaultModel;
  }

  async generateSummary(title, description) {
    if (!this.isConfigured()) {
      throw new Error('Claude API key not configured');
    }

    const prompt = `Please provide a concise, informative summary of this historical event in 2-3 sentences:

Title: ${title}
Description: ${description}

Focus on the key facts, significance, and impact. Keep it engaging but factual.`;

    const response = await axios.post(
      this.config.endpoint,
      {
        model: this.getModel(),
        max_tokens: this.config.maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      {
        headers: {
          [this.config.authHeader]: this.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': this.config.version
        }
      }
    );

    const summary = response.data.content[0]?.text?.trim();

    if (!summary) {
      throw new Error('No summary generated');
    }

    return {
      summary,
      source: 'claude',
      model: this.getModel()
    };
  }
}

export default ClaudeAdapter;