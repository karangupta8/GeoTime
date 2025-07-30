import axios from 'axios';

class OllamaAdapter {
  constructor(config) {
    this.config = config;
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  }

  isConfigured() {
    // Ollama doesn't require API key, just needs to be running
    return true;
  }

  getModel() {
    return process.env.OLLAMA_MODEL || this.config.defaultModel;
  }

  async generateSummary(title, description) {
    const prompt = `Please provide a concise, informative summary of this historical event in 2-3 sentences:

Title: ${title}
Description: ${description}

Focus on the key facts, significance, and impact. Keep it engaging but factual.`;

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/generate`,
        {
          model: this.getModel(),
          prompt: prompt,
          stream: false,
          options: {
            temperature: this.config.temperature,
            num_predict: this.config.maxTokens
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout for local models
        }
      );

      const summary = response.data.response?.trim();

      if (!summary) {
        throw new Error('No summary generated');
      }

      return {
        summary,
        source: 'ollama',
        model: this.getModel()
      };
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Ollama server not running. Please start Ollama and try again.');
      }
      throw error;
    }
  }
}

export default OllamaAdapter;