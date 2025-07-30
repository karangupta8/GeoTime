import express from 'express';
import LLMAdapter from '../services/LLMAdapter.js';

const router = express.Router();

// LLM proxy endpoint for event summarization
router.post('/summarize-event', async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ 
        error: 'Title and description are required' 
      });
    }

    const llmAdapter = new LLMAdapter();
    const result = await llmAdapter.generateSummary(title, description);

    res.json(result);

  } catch (error) {
    console.error('Summary generation error:', error);
    
    // Fallback to simple summary on error
    const { title, description } = req.body;
    res.json({
      summary: `${description ? description.substring(0, 150) : 'Historical event'}...`,
      source: 'fallback',
      error: error.message || 'AI summarization unavailable'
    });
  }
});

// Get current LLM provider info
router.get('/llm-info', (req, res) => {
  try {
    const llmAdapter = new LLMAdapter();
    const info = llmAdapter.getProviderInfo();
    res.json(info);
  } catch (error) {
    console.error('Error getting LLM info:', error);
    res.status(500).json({ error: 'Failed to get LLM provider information' });
  }
});

export default router;