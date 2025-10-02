const axios = require('axios');

class InsightGenerator {
    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY;
        this.model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku';
        this.baseURL = 'https://openrouter.ai/api/v1/chat/completions';
    }

    async generateFromFragments(fragments) {
        try {
            const fragmentSummary = this.summarizeFragments(fragments);
            
            const prompt = `
Analyze these Bitcoin memory fragments and generate collective insights:

${fragmentSummary}

Generate 3-5 key insights about Bitcoin adoption patterns. Return ONLY valid JSON:

{
  "insights": [
    {
      "pattern": "Coffee shops increasingly accepting Bitcoin",
      "evidence": "3 fragments mention coffee purchases",
      "confidence": 85,
      "implications": "Food service Bitcoin adoption growing",
      "category": "adoption"
    }
  ]
}
            `.trim();

            const response = await axios.post(this.baseURL, {
                model: this.model,
                messages: [
                    {
                        role: "system",
                        content: "You are an AI that identifies Bitcoin adoption patterns. Return only valid JSON, no other text."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 800,
                temperature: 0.4
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://bitcoin-memory-palace.com',
                    'X-Title': 'Bitcoin Memory Palace'
                }
            });

            const result = JSON.parse(response.data.choices[0].message.content);
            
            return {
                insights: result.insights.map(insight => ({
                    ...insight,
                    generated_at: new Date().toISOString(),
                    insight_id: this.generateInsightId()
                })),
                total_fragments_analyzed: fragments.length,
                generation_timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Insight generation error:', error);
            return this.getFallbackInsights(fragments);
        }
    }

    summarizeFragments(fragments) {
        return fragments.map((frag, index) => 
            `Fragment ${index + 1}: "${frag.content}" (${frag.category})`
        ).join('\n');
    }

    getFallbackInsights(fragments) {
        // Generate basic insights without AI
        const categories = [...new Set(fragments.map(f => f.category))];
        const locations = [...new Set(fragments.map(f => f.location).filter(Boolean))];
        
        return {
            insights: [
                {
                    pattern: `Bitcoin activity observed across ${categories.length} different categories`,
                    evidence: `Categories: ${categories.join(', ')}`,
                    confidence: 70,
                    implications: "Diversified Bitcoin use cases emerging",
                    category: "adoption",
                    generated_at: new Date().toISOString(),
                    insight_id: this.generateInsightId()
                }
            ],
            total_fragments_analyzed: fragments.length,
            generation_timestamp: new Date().toISOString()
        };
    }

    generateInsightId() {
        return `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

module.exports = { InsightGenerator };