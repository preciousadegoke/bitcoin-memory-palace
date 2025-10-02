const axios = require('axios');

class MemoryAnalyzer {
    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY;
        this.model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku';
        this.baseURL = 'https://openrouter.ai/api/v1/chat/completions';
    }

    async processFragment({ content, category, location }) {
        try {
            const prompt = `Analyze this Bitcoin memory fragment: "${content}" (Category: ${category}, Location: ${location || 'Unknown'})

Return only valid JSON:
{
  "sentiment": "positive",
  "topics": ["bitcoin", "payment"],
  "use_case": "payment", 
  "adoption_strength": 8,
  "confidence": 85,
  "geographic_relevance": "local"
}`;

            const response = await axios.post(this.baseURL, {
                model: this.model,
                messages: [
                    { role: "system", content: "You analyze Bitcoin adoption patterns. Return only valid JSON." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 200,
                temperature: 0.3
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://bitcoin-memory-palace.com',
                    'X-Title': 'Bitcoin Memory Palace'
                }
            });

            const analysis = JSON.parse(response.data.choices[0].message.content);
            
            return {
                ...analysis,
                processed_at: new Date().toISOString(),
                fragment_id: `frag_${Date.now()}`
            };

        } catch (error) {
            console.error('AI Error:', error.message);
            // Fallback analysis
            return {
                sentiment: 'neutral',
                topics: content.toLowerCase().split(' ').slice(0, 3),
                use_case: category,
                adoption_strength: 5,
                confidence: 60,
                geographic_relevance: 'unknown',
                processed_at: new Date().toISOString(),
                fragment_id: `frag_${Date.now()}`
            };
        }
    }
}

module.exports = { MemoryAnalyzer };