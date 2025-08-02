import express from 'express';
import LLMService from '../services/llmService.js';

const router = express.Router();
let llmService = null;

// Initialize LLM service lazily to avoid startup validation errors
const getLLMService = () => {
  if (!llmService) {
    try {
      llmService = new LLMService();
    } catch (error) {
      console.warn('LLM service initialization failed:', error.message);
      return null;
    }
  }
  return llmService;
};

// Generate AI summary for historical events
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ 
        error: 'Title and description are required' 
      });
    }

    console.log(`Generating summary for: ${title}`);
    
    // Try to generate summary with configured LLM
    let result;
    const service = getLLMService();
    if (service) {
      try {
        result = await service.generateSummary(title, description);
      } catch (llmError) {
        console.warn('LLM API failed, using fallback:', llmError.message);
        result = service.generateFallbackSummary(title, description);
      }
    } else {
      // Use fallback if LLM service is not available
      result = {
        summary: description.length > 100 ? description.substring(0, 97) + '...' : description,
        provider: 'fallback',
        model: 'none'
      };
    }
    
    res.json({
      success: true,
      summary: result.summary,
      provider: result.provider,
      model: result.model,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ 
      error: 'Failed to generate summary',
      message: error.message 
    });
  }
});

export default router;