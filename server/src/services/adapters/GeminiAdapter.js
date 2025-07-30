import axios from 'axios';

class GeminiAdapter {
  constructor(config) {
    this.config = config;
    this.apiKey = process.env.GEMINI_API_KEY;
  }

  isConfigured() {
    return !!this.apiKey;
  }

  getModel() {
    return process.env.GEMINI_MODEL || this.config.defaultModel;
  }

  async generateSummary(title, description) {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = `Please provide a concise, informative summary of this historical event in 2-3 sentences:

Title: ${title}
Description: ${description}

Focus on the key facts, significance, and impact. Keep it engaging but factual.`;

    const endpoint = this.config.endpoint.replace('{model}', this.getModel());
    
    const response = await axios.post(
      `${endpoint}?${this.config.authParam}=${this.apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxTokens
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const summary = response.data.candidates[0]?.content?.parts[0]?.text?.trim();

    if (!summary) {
      throw new Error('No summary generated');
    }

    return {
      summary,
      source: 'gemini',
      model: this.getModel()
    };
  }
}

export default GeminiAdapter;