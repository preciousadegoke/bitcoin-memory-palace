const axios = require('axios');

class QueryEngine {
    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY;
        this.model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku';
        this.baseURL = 'https://openrouter.ai/api/v1/chat/completions';
    }

    async processQuery(question, fragments) {
        try {
            const fragmentContext = this.buildContext(fragments);
            
            const prompt = `
You are the collective Bitcoin intelligence. Answer this question using memory fragments from actual Bitcoin users:

Question: "${question}"

Memory Fragments:
${fragmentContext}

Return ONLY valid JSON:
{
  "answer": "your helpful response based on the fragments",
  "confidence": 85,
  "sources": ["fragment 1", "fragment 3"],
  "suggestions": ["related question 1", "related question 2"]
}
            `.trim();

            const response = await axios.post(this.baseURL, {
                model: this.model,
                messages: [
                    {
                        role: "system",
                        content: "You are the collective Bitcoin intelligence. Answer questions based on real user experiences. Return only valid JSON."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 500,
                temperature: 0.3
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
                ...result,
                query: question,
                processed_at: new Date().toISOString(),
                fragments_analyzed: fragments.length
            };

        } catch (error) {
            console.error('Query processing error:', error);
            return this.getFallbackAnswer(question, fragments);
        }
    }

    buildContext(fragments) {
        return fragments.slice(0, 10).map((frag, index) => 
            `${index + 1}. "${frag.content}" (${frag.category}${frag.location ? `, ${frag.location}` : ''})`
        ).join('\n');
    }

    getFallbackAnswer(question, fragments) {
        return {
            answer: `I found ${fragments.length} memory fragments, but need more context to answer your specific question about: "${question}". Try asking about Bitcoin payments, adoption, or user experiences.`,
            confidence: 30,
            sources: [],
            suggestions: [
                "Where can I spend Bitcoin?",
                "How are people using Bitcoin for payments?",
                "What's the Bitcoin user experience like?"
            ],
            query: question,
            processed_at: new Date().toISOString(),
            fragments_analyzed: fragments.length
        };
    }
}

module.exports = { QueryEngine };