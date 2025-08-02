

class LLMService {
  constructor() {
    this.provider = 'fallback'; // Always use fallback mode
  }

  async generateSummary(title, description) {
    try {
      console.log(`Generating summary using fallback mode for: ${title}`);
      return this.generateFallbackSummary(title, description);
    } catch (error) {
      console.error('Error generating LLM summary:', error);
      throw error;
    }
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