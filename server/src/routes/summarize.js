import express from 'express';
import LLMService from '../services/llmService.js';

const router = express.Router();
const llmService = new LLMService();

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
    try {
      result = await llmService.generateSummary(title, description);
    } catch (llmError) {
      console.warn('LLM API failed, using fallback:', llmError.message);
      result = llmService.generateFallbackSummary(title, description);
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