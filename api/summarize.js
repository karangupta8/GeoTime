export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    console.log(`Generating summary for: ${title}`);
    
    // Try to generate summary with LLM
    let result;
    try {
      result = await generateLLMSummary(title, description);
    } catch (llmError) {
      console.warn('LLM API failed, using fallback:', llmError.message);
      result = generateFallbackSummary(title, description);
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
}

// Function to generate summary using LLM API
async function generateLLMSummary(title, description) {
  // Check which API keys are available
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasGoogle = !!process.env.GOOGLE_API_KEY;
  const hasGroq = !!process.env.GROQ_API_KEY;
  
  console.log('Available API keys:', {
    openai: hasOpenAI,
    anthropic: hasAnthropic,
    google: hasGoogle,
    groq: hasGroq
  });

  // Get API key from environment variables
  const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GOOGLE_API_KEY || process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('No LLM API key configured. Please set OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_API_KEY, or GROQ_API_KEY in your environment variables.');
  }

  // Determine which provider to use based on available API keys
  let provider = 'openai';
  let model = 'gpt-4o-mini';
  let baseUrl = 'https://api.openai.com/v1';
  let headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
  let payload = {
    model: model,
    messages: [
      {
        role: 'system',
        content: 'You are a historical expert. Create engaging, accurate, and concise summaries of historical events. Focus on significance, context, and impact. Keep summaries to exactly 100 words or less.'
      },
      {
        role: 'user',
        content: `Summarize this historical event in 100 words or less:\n\nTitle: ${title}\n\nDescription: ${description}`
      }
    ],
    max_tokens: 150,
    temperature: 0.7
  };

  // Try different providers if available (priority order)
  if (hasAnthropic) {
    provider = 'anthropic';
    model = 'claude-3-haiku-20240307';
    baseUrl = 'https://api.anthropic.com/v1';
    headers = { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' };
    payload = {
      model: model,
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: `You are a historical expert. Create engaging, accurate, and concise summaries of historical events. Focus on significance, context, and impact. Keep summaries to exactly 100 words or less.

Summarize this historical event in 100 words or less:

Title: ${title}

Description: ${description}`
        }
      ],
      temperature: 0.7
    };
  } else if (hasGoogle) {
    provider = 'google';
    model = 'gemini-1.5-flash';
    baseUrl = 'https://generativelanguage.googleapis.com/v1';
    const prompt = `You are a historical expert. Create engaging, accurate, and concise summaries of historical events. Focus on significance, context, and impact. Keep summaries to exactly 100 words or less.

Summarize this historical event in 100 words or less:

Title: ${title}

Description: ${description}`;
    
    payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 150,
      }
    };
  } else if (hasGroq) {
    provider = 'groq';
    model = 'llama3-8b-8192';
    baseUrl = 'https://api.groq.com/openai/v1';
    headers = { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' };
  }

  console.log(`Attempting to use ${provider} API with model ${model}`);

  const endpoint = provider === 'google' 
    ? `${baseUrl}/models/${model}:generateContent?key=${process.env.GOOGLE_API_KEY}`
    : `${baseUrl}/chat/completions`;

  console.log(`Making request to: ${endpoint}`);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  console.log(`Response status: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error Response:', errorText);
    throw new Error(`LLM API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  console.log('API Response received:', JSON.stringify(data, null, 2));
  
  let summary;
  if (provider === 'openai' || provider === 'groq') {
    summary = data.choices?.[0]?.message?.content;
  } else if (provider === 'anthropic') {
    summary = data.content?.[0]?.text;
  } else if (provider === 'google') {
    summary = data.candidates?.[0]?.content?.parts?.[0]?.text;
  }

  if (!summary) {
    console.error('No summary found in API response:', data);
    throw new Error('Invalid response from LLM API - no summary content found');
  }

  console.log(`Successfully generated summary using ${provider}:`, summary.substring(0, 100) + '...');

  return {
    summary,
    provider,
    model
  };
}

// Fallback summary generator (no API call)
function generateFallbackSummary(title, description) {
  console.log('Using fallback summary generation');
  
  const truncatedDescription = description.length > 100 
    ? description.substring(0, 97) + '...'
    : description;
  
  return {
    summary: truncatedDescription,
    provider: 'fallback',
    model: 'none'
  };
}