import express from 'express';
import axios from 'axios';

const router = express.Router();

// OpenAI proxy endpoint for event summarization
router.post('/summarize-event', async (req, res) => {
  try {
    const { title, description } = req.body;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!title || !description) {
      return res.status(400).json({ 
        error: 'Title and description are required' 
      });
    }

    // If OpenAI API key is not configured, return a simple fallback summary
    if (!openaiApiKey) {
      console.warn('OpenAI API key not configured, using fallback summary');
      return res.json({
        summary: `${description.substring(0, 150)}...`,
        source: 'fallback'
      });
    }

    const prompt = `Please provide a concise, informative summary of this historical event in 2-3 sentences:

Title: ${title}
Description: ${description}

Focus on the key facts, significance, and impact. Keep it engaging but factual.`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const summary = response.data.choices[0]?.message?.content?.trim();

    if (!summary) {
      throw new Error('No summary generated');
    }

    res.json({
      summary,
      source: 'openai'
    });

  } catch (error) {
    console.error('Summary generation error:', error);
    
    // Fallback to simple summary on error
    const { title, description } = req.body;
    res.json({
      summary: `${description ? description.substring(0, 150) : 'Historical event'}...`,
      source: 'fallback',
      error: 'AI summarization unavailable'
    });
  }
});

export default router;