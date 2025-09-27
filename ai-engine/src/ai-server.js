require('dotenv').config(); 
const express = require('express'); 
const cors = require('cors'); 
 
const app = express(); 
app.use(cors()); 
app.use(express.json()); 
 
app.get('/health', (req, res) => { 
    res.json({ status: 'AI Engine Working!' }); 
}); 
 
app.listen(3001, () => { 
    console.log('Server running on port 3001'); 
}); 
