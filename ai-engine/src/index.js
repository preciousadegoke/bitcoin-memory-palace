require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ 
        status: '🧠 AI Engine Ready!',
        timestamp: new Date().toISOString()
    });
});

app.post('/test-fragment', (req, res) => {
    const { content } = req.body;
    
    // Simple test response (no AI for now)
    res.json({
        analysis: {
            sentiment: 'positive',
            topics: content.split(' ').slice(0, 3),
            confidence: 85,
            fragment_id: `test_${Date.now()}`
        }
    });
});

app.listen(3001, () => {
    console.log('🚀 Bitcoin Memory Palace AI running on http://localhost:3001');
    console.log('✅ Ready for testing!');
});