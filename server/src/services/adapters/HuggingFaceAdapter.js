import axios from 'axios';

class HuggingFaceAdapter {
  constructor(config) {
    this.config = config;
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
  }

  isConfigured() {
    return !!this.apiKey;
  }

  getModel() {
    return process.env.HUGGINGFACE_MODEL || this.config.defaultModel;
  }

  async generateSummary(title, description) {
    if (!this.isConfigured()) {
      throw new Error('Hugging Face API key not configured');
    }

    const prompt = `Please provide a concise, informative summary of this historical event in 2-3 sentences:

Title: ${title}
Description: ${description}

Focus on the key facts, significance, and impact. Keep it engaging but factual.`;

    const endpoint = this.config.endpoint.replace('{model}', this.getModel());

    const response = await axios.post(
      endpoint,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          return_full_text: false
        }
      },
      {
        headers: {
          [this.config.authHeader]: `${this.config.authPrefix} ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let summary;
    if (Array.isArray(response.data)) {
      summary = response.data[0]?.generated_text?.trim();
    } else {
      summary = response.data.generated_text?.trim();
    }

    if (!summary) {
      throw new Error('No summary generated');
    }

    return {
      summary,
      source: 'huggingface',
      model: this.getModel()
    };
  }
}

export default HuggingFaceAdapter;