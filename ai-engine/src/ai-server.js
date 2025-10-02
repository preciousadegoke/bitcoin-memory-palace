require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: '🧠 Bitcoin Memory Palace AI is ALIVE!',
        timestamp: new Date().toISOString(),
        api_ready: !!process.env.OPENROUTER_API_KEY,
        endpoints: [
            'POST /analyze-fragment',
            'POST /generate-insights',
            'POST /query'
        ]
    });
});

// Analyze individual memory fragments
app.post('/analyze-fragment', (req, res) => {
    const { content, category, location } = req.body;
    
    if (!content) {
        return res.status(400).json({
            success: false,
            message: 'Content is required for fragment analysis'
        });
    }
    
    // Enhanced analysis logic
    const words = content.toLowerCase().split(' ');
    const bitcoinTerms = ['bitcoin', 'btc', 'satoshi', 'lightning', 'wallet', 'hodl', 'mining'];
    const sentimentWords = {
        positive: ['good', 'great', 'fast', 'easy', 'love', 'amazing', 'excellent', 'smooth'],
        negative: ['slow', 'expensive', 'difficult', 'problem', 'issue', 'hate', 'terrible']
    };
    
    // Calculate sentiment
    const positiveCount = words.filter(word => sentimentWords.positive.includes(word)).length;
    const negativeCount = words.filter(word => sentimentWords.negative.includes(word)).length;
    let sentiment = 'neutral';
    if (positiveCount > negativeCount) sentiment = 'positive';
    if (negativeCount > positiveCount) sentiment = 'negative';
    
    // Extract topics
    const topics = words.filter(word => bitcoinTerms.includes(word) || word.length > 4)
                       .slice(0, 3);
    
    // Calculate confidence based on content richness
    const confidence = Math.min(95, 50 + (content.length / 10) + (topics.length * 10));
    
    res.json({
        success: true,
        analysis: {
            content: content,
            sentiment: sentiment,
            topics: topics,
            confidence: Math.round(confidence),
            category: category || 'general',
            location: location || null,
            word_count: words.length,
            bitcoin_relevance: words.filter(word => bitcoinTerms.includes(word)).length > 0,
            processed_at: new Date().toISOString()
        }
    });
});

// Generate collective insights from multiple fragments
app.post('/generate-insights', (req, res) => {
    const { fragments } = req.body;
    
    if (!fragments || !Array.isArray(fragments) || fragments.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Valid fragments array is required'
        });
    }

    // Analyze fragment patterns
    const categories = [...new Set(fragments.map(f => f.category).filter(Boolean))];
    const locations = [...new Set(fragments.filter(f => f.location).map(f => f.location))];
    const sentiments = fragments.map(f => f.analysis?.sentiment || 'neutral');
    const totalFragments = fragments.length;
    
    // Calculate sentiment distribution
    const sentimentCounts = {
        positive: sentiments.filter(s => s === 'positive').length,
        negative: sentiments.filter(s => s === 'negative').length,
        neutral: sentiments.filter(s => s === 'neutral').length
    };
    
    const insights = [];
    
    // Adoption insight
    if (categories.length > 0) {
        insights.push({
            id: `adoption_${Date.now()}`,
            pattern: `Bitcoin adoption across ${categories.length} use case${categories.length > 1 ? 's' : ''}`,
            evidence: `${totalFragments} experiences in: ${categories.join(', ')}`,
            confidence: Math.min(95, 60 + (totalFragments * 5)),
            implications: "Diversified Bitcoin use cases indicate growing mainstream adoption",
            category: "adoption",
            data: { categories, fragment_count: totalFragments }
        });
    }
    
    // Sentiment insight
    const positiveRatio = sentimentCounts.positive / totalFragments;
    if (positiveRatio > 0.6) {
        insights.push({
            id: `sentiment_${Date.now()}`,
            pattern: "Predominantly positive Bitcoin experiences",
            evidence: `${sentimentCounts.positive}/${totalFragments} experiences show positive sentiment`,
            confidence: 85,
            implications: "Strong positive sentiment suggests improving user experience",
            category: "sentiment",
            data: sentimentCounts
        });
    } else if (positiveRatio < 0.4) {
        insights.push({
            id: `sentiment_${Date.now()}`,
            pattern: "Mixed or challenging Bitcoin experiences",
            evidence: `${sentimentCounts.negative + sentimentCounts.neutral}/${totalFragments} experiences show neutral/negative sentiment`,
            confidence: 80,
            implications: "User experience improvements may be needed",
            category: "sentiment",
            data: sentimentCounts
        });
    }
    
    // Geographic insight
    if (locations.length > 1) {
        insights.push({
            id: `geographic_${Date.now()}`,
            pattern: `Bitcoin usage across ${locations.length} geographic areas`,
            evidence: `Experiences from: ${locations.join(', ')}`,
            confidence: 80,
            implications: "Geographic distribution suggests global Bitcoin adoption",
            category: "geographic",
            data: { locations, count: locations.length }
        });
    }
    
    // Payment-specific insight
    const paymentFragments = fragments.filter(f => f.category === 'payment');
    if (paymentFragments.length > 0) {
        const paymentSentiment = paymentFragments.map(f => f.analysis?.sentiment || 'neutral');
        const positivePayments = paymentSentiment.filter(s => s === 'positive').length;
        
        insights.push({
            id: `payment_${Date.now()}`,
            pattern: "Bitcoin payment experience trends",
            evidence: `${paymentFragments.length} payment experiences, ${positivePayments} positive`,
            confidence: Math.min(90, 70 + (paymentFragments.length * 5)),
            implications: paymentFragments.length > 0 ? 
                (positivePayments / paymentFragments.length > 0.5 ? 
                    "Bitcoin payments becoming more user-friendly" : 
                    "Payment experience has room for improvement") : 
                "Limited payment data available",
            category: "payment",
            data: { 
                total: paymentFragments.length, 
                positive: positivePayments,
                ratio: positivePayments / paymentFragments.length 
            }
        });
    }

    res.json({
        success: true,
        insights: insights,
        metadata: {
            total_fragments_analyzed: totalFragments,
            categories_found: categories,
            locations_found: locations,
            sentiment_distribution: sentimentCounts,
            generation_timestamp: new Date().toISOString()
        }
    });
});

// Query the collective intelligence
app.post('/query', (req, res) => {
    const { question, fragments = [] } = req.body;
    
    if (!question) {
        return res.status(400).json({
            success: false,
            message: 'Question is required for query'
        });
    }
    
    // Simple keyword matching for relevant fragments
    const questionWords = question.toLowerCase().split(' ');
    const relevantFragments = fragments.filter(fragment => {
        const content = (fragment.content || '').toLowerCase();
        return questionWords.some(word => content.includes(word)) ||
               (fragment.category && questionWords.includes(fragment.category.toLowerCase()));
    });
    
    // Generate contextual response
    let response;
    let confidence;
    let sources = [];
    
    if (relevantFragments.length > 0) {
        const categories = [...new Set(relevantFragments.map(f => f.category))].filter(Boolean);
        const sentiments = relevantFragments.map(f => f.analysis?.sentiment || 'neutral');
        const positiveCount = sentiments.filter(s => s === 'positive').length;
        
        response = `Based on ${relevantFragments.length} relevant Bitcoin experiences from the community: `;
        
        if (categories.length > 0) {
            response += `Most experiences relate to ${categories.join(' and ')}. `;
        }
        
        if (positiveCount > relevantFragments.length / 2) {
            response += `The community generally reports positive experiences with this aspect of Bitcoin. `;
        } else {
            response += `The community has mixed experiences with this aspect of Bitcoin. `;
        }
        
        response += `Regarding "${question}", the collective intelligence suggests continued Bitcoin adoption and learning.`;
        
        confidence = Math.min(90, 40 + (relevantFragments.length * 10) + (positiveCount * 5));
        sources = [`${relevantFragments.length} relevant community experiences`];
    } else {
        response = `I don't have specific community experiences directly related to "${question}" yet. As more Bitcoin users share their experiences, I'll be able to provide more targeted insights.`;
        confidence = 30;
        sources = [`${fragments.length} total community experiences (none directly relevant)`];
    }
    
    const suggestions = [
        "Where can I spend Bitcoin?",
        "How fast are Bitcoin payments?",
        "What's the Bitcoin user experience like?",
        "How do people feel about Bitcoin mining?",
        "What are common Bitcoin wallet experiences?"
    ];

    res.json({
        success: true,
        answer: {
            response: response,
            confidence: Math.round(confidence),
            sources: sources,
            suggestions: suggestions.filter(s => s !== question).slice(0, 3)
        },
        query: question,
        metadata: {
            total_fragments: fragments.length,
            relevant_fragments: relevantFragments.length,
            processed_at: new Date().toISOString()
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Endpoint ${req.method} ${req.path} not found`,
        available_endpoints: [
            'GET /health',
            'POST /analyze-fragment', 
            'POST /generate-insights',
            'POST /query'
        ]
    });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log('🧠 Bitcoin Memory Palace AI running on http://localhost:' + PORT);
    console.log('✅ Ready to make Bitcoin intelligent!');
    console.log('🌐 Health check: http://localhost:' + PORT + '/health');
    console.log('📊 Endpoints available:');
    console.log('  POST /analyze-fragment - Analyze individual Bitcoin experiences');
    console.log('  POST /generate-insights - Generate collective intelligence insights');  
    console.log('  POST /query - Query the Bitcoin collective brain');
});