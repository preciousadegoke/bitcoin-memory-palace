require('dotenv').config();
const axios = require('axios');

async function testAI() {
    console.log('🧠 Starting AI Test...');
    console.log('✅ API Key loaded:', !!process.env.OPENROUTER_API_KEY);
    
    try {
        console.log('📡 Making API request...');
        
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'anthropic/claude-3-haiku',
            messages: [
                { role: 'user', content: 'Say "Bitcoin AI test successful" in JSON format' }
            ],
            max_tokens: 50
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000  // 10 second timeout
        });

        console.log('✅ SUCCESS! AI responded:', response.data.choices[0].message.content);
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data);
        }
    }
    
    console.log('🎉 Test complete!');
}

testAI();