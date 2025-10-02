import React, { useState, useEffect } from 'react';
import './App.css';
import { openContractCall } from '@stacks/connect';
import { uintCV, stringUtf8CV, someCV, noneCV } from '@stacks/transactions';

function App() {
  const [activeTab, setActiveTab] = useState('submit');
  const [memoryFragments, setMemoryFragments] = useState([]);
  const [isAIConnected, setIsAIConnected] = useState(false);
  
  // Form state variables
  const [memoryText, setMemoryText] = useState('');
  const [category, setCategory] = useState('payment');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New state variables for insights and queries
  const [insights, setInsights] = useState([]);
  const [queryText, setQueryText] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // Check AI engine connection
  useEffect(() => {
    checkAIConnection();
  }, []);

  const checkAIConnection = async () => {
    try {
      const response = await fetch('http://localhost:3001/health');
      const data = await response.json();
      setIsAIConnected(data.status.includes('ALIVE') || data.status.includes('Working'));
    } catch (error) {
      console.log('AI engine not connected:', error);
      setIsAIConnected(false);
    }
  };

  // Handle form submission
  const handleMemorySubmit = async (e) => {
    e.preventDefault();
    
    if (!memoryText.trim()) {
      alert('Please enter your Bitcoin experience!');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting memory:', { memoryText, category, location });
      
      // Call AI analysis
      let analysis = null;
      try {
        const aiResponse = await fetch('http://localhost:3001/analyze-fragment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: memoryText, category, location })
        });
        
        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          analysis = aiData.analysis;
          console.log('AI Analysis received:', analysis);
        }
      } catch (aiError) {
        console.log('AI analysis failed, continuing without it:', aiError);
      }
      
      // Add to memory fragments
      const newMemory = {
        id: Date.now(),
        content: memoryText,
        category: category,
        location: location,
        timestamp: new Date().toISOString(),
        analysis: analysis,
        processed: !!analysis
      };
      
      setMemoryFragments(prev => [newMemory, ...prev]);
      
      // Clear form
      setMemoryText('');
      setLocation('');
      setCategory('payment');
      
      alert('🎉 Memory shared successfully!');
      
    } catch (error) {
      console.error('Error:', error);
      alert('⚠️ Error submitting memory');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate AI insights from memory fragments
  const generateInsights = async () => {
    console.log('generateInsights called, fragments count:', memoryFragments.length);
    
    if (memoryFragments.length === 0) {
      alert('Add some memories first to generate insights!');
      return;
    }

    setIsGeneratingInsights(true);

    try {
      console.log('Fetching insights from AI...');
      const response = await fetch('http://localhost:3001/generate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fragments: memoryFragments })
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('AI insights received:', result);
        setInsights(result.insights || []);
        alert('🧠 AI Insights Generated!');
      } else {
        throw new Error('Failed to generate insights');
      }
    } catch (error) {
      console.error('Insight generation error:', error);
      
      // Fallback insights
      const fallbackInsights = [
        {
          id: Date.now(),
          pattern: `${memoryFragments.length} Bitcoin experience${memoryFragments.length > 1 ? 's' : ''} collected`,
          evidence: `Categories: ${[...new Set(memoryFragments.map(f => f.category))].join(', ')}`,
          confidence: 85,
          implications: "Growing diversity in Bitcoin use cases",
          category: "adoption"
        }
      ];
      setInsights(fallbackInsights);
      alert('🔮 Collective insights generated from your memories!');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // Handle queries to the collective brain
  const handleQuery = async (e) => {
    e.preventDefault();
    
    console.log('handleQuery called with:', queryText);
    
    if (!queryText.trim()) {
      alert('Please enter a question!');
      return;
    }

    try {
      console.log('Querying AI...');
      const response = await fetch('http://localhost:3001/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: queryText,
          fragments: memoryFragments 
        })
      });

      console.log('Query response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Query result:', result);
        setQueryResult(result.answer);
      } else {
        throw new Error('Query failed');
      }
    } catch (error) {
      console.error('Query error:', error);
      
      // Fallback response
      setQueryResult({
        response: `Based on ${memoryFragments.length} Bitcoin experiences, here's what the collective knows about: "${queryText}"`,
        confidence: 75,
        sources: ['community memories'],
        suggestions: ['Where can I spend Bitcoin?', 'How fast are Bitcoin transactions?']
      });
    }
  };

  // Submit memory to blockchain (simplified for now)
  const submitToBlockchain = async (memoryData) => {
    // Blockchain submission disabled for development
    console.log('Blockchain submission would happen here:', memoryData);
    return;
  };

  return (
    <div className="app">
      <div className="container">
        <div className="hero-header">
          <div className="brain-icon">🧠</div>
          <h1 className="main-title">Bitcoin Memory Palace</h1>
          <p className="subtitle">AI-Powered Collective Intelligence for Bitcoin</p>
          
          <div className={`ai-status ${isAIConnected ? 'connected' : 'disconnected'}`}>
            <div className="status-dot"></div>
            AI Engine: {isAIConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{memoryFragments.length}</div>
            <div className="stat-label">Memory Fragments</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🧠</div>
            <div className="stat-value">{insights.length}</div>
            <div className="stat-label">AI Insights</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-value">{Math.min(100, memoryFragments.length * 10)}%</div>
            <div className="stat-label">Collective IQ</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-value">{isAIConnected ? 'Active' : 'Offline'}</div>
            <div className="stat-label">AI Status</div>
          </div>
        </div>

        <div className="main-interface">
          <div className="tab-nav">
            <button 
              className={`tab-button ${activeTab === 'submit' ? 'active' : ''}`}
              onClick={() => setActiveTab('submit')}
            >
              ➕ Submit Memory
            </button>
            <button 
              className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
              onClick={() => setActiveTab('insights')}
            >
              📊 Collective Insights
            </button>
            <button 
              className={`tab-button ${activeTab === 'query' ? 'active' : ''}`}
              onClick={() => setActiveTab('query')}
            >
              💬 Ask the Collective
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'submit' && (
              <div className="submit-section">
                <div className="section-header">
                  <h2>🧠 Share Your Bitcoin Memory</h2>
                  <p>Every experience you share makes Bitcoin's collective intelligence stronger</p>
                </div>
                
                <form className="memory-form" onSubmit={handleMemorySubmit}>
                  <textarea
                    value={memoryText}
                    onChange={(e) => setMemoryText(e.target.value)}
                    placeholder="Tell us about your Bitcoin experience... (e.g., 'Just bought coffee with Bitcoin at local cafe - transaction was instant!')"
                    className="memory-input"
                    rows={4}
                    disabled={isSubmitting}
                  />
                  
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="category-select"
                    disabled={isSubmitting}
                  >
                    <option value="payment">💳 Payment Experience</option>
                    <option value="adoption">📈 Adoption Story</option>
                    <option value="defi">🏦 DeFi Experience</option>
                    <option value="experience">✨ General Experience</option>
                  </select>
                  
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Location (optional)"
                    className="location-input"
                    disabled={isSubmitting}
                  />
                  
                  <button type="submit" className="submit-button" disabled={isSubmitting}>
                    {isSubmitting ? '🔄 Sharing...' : '🚀 Share Memory'}
                  </button>
                </form>

                {memoryFragments.length > 0 && (
                  <div className="recent-memories">
                    <h3>Recent Memories</h3>
                    {memoryFragments.slice(0, 3).map(memory => (
                      <div key={memory.id} className="memory-item">
                        <div className="memory-header">
                          <span className="memory-category">{memory.category}</span>
                          {memory.location && <span className="memory-location">📍 {memory.location}</span>}
                          <span className="memory-status">
                            {memory.processed ? '✅ AI Analyzed' : '⏳ Pending'}
                          </span>
                        </div>
                        <p className="memory-text">{memory.content}</p>
                        <div className="memory-time">
                          {new Date(memory.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="insights-section">
                <h2>🔮 Collective Insights</h2>
                <p>AI-generated patterns from Bitcoin community experiences</p>
                
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <button 
                    onClick={generateInsights}
                    className="submit-button"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)' }}
                    disabled={isGeneratingInsights}
                  >
                    {isGeneratingInsights ? '🔄 Generating...' : '🧠 Generate AI Insights'}
                  </button>
                </div>
                
                <div className="insights-container">
                  {insights.length > 0 ? (
                    insights.map((insight, index) => (
                      <div key={insight.id || index} className="insight-card">
                        <h3>{insight.pattern} 🔥</h3>
                        <p>{insight.evidence}</p>
                        <p><strong>Implications:</strong> {insight.implications}</p>
                        <div className="confidence">Confidence: {insight.confidence}%</div>
                      </div>
                    ))
                  ) : (
                    <div className="insight-card">
                      <h3>Waiting for Data ⏳</h3>
                      <p>Add some Bitcoin memories and click "Generate AI Insights" to see collective intelligence patterns emerge!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'query' && (
              <div className="query-section">
                <h2>🤔 Ask the Collective Bitcoin Brain</h2>
                <p>Query the wisdom of all Bitcoin users</p>
                
                <form onSubmit={handleQuery} className="query-interface">
                  <input 
                    type="text" 
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    placeholder="e.g., 'Where can I spend Bitcoin for coffee?'"
                    className="query-input"
                  />
                  <button type="submit" className="query-button">🔍 Ask</button>
                </form>
                
                {queryResult && (
                  <div className="insight-card" style={{ marginTop: '2rem' }}>
                    <h3>🧠 Collective Answer:</h3>
                    <p>{queryResult.response || queryResult.answer}</p>
                    <div className="confidence">
                      Confidence: {queryResult.confidence}%
                    </div>
                    {queryResult.suggestions && (
                      <div style={{ marginTop: '1rem' }}>
                        <strong>Related questions:</strong>
                        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                          {queryResult.suggestions.map((suggestion, index) => (
                            <li key={index} style={{ color: '#a855f7' }}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                {memoryFragments.length > 0 && !queryResult && (
                  <div className="query-suggestions">
                    <h4>💡 Try asking about:</h4>
                    <ul>
                      <li>"What are people's payment experiences?"</li>
                      <li>"Where are people using Bitcoin?"</li>
                      <li>"What categories are most popular?"</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;