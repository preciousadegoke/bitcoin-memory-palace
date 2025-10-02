 import React, { useState } from 'react';
import { Send, Loader, CheckCircle, Brain } from 'lucide-react';

const MemorySubmission = ({ onNewMemory, isAIConnected }) => {
  const [formData, setFormData] = useState({
    content: '',
    category: 'payment',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(null);

  const categories = [
    { value: 'payment', label: '💳 Payment Experience' },
    { value: 'adoption', label: '📈 Adoption Story' },
    { value: 'defi', label: '🏦 DeFi Experience' },
    { value: 'experience', label: '✨ General Experience' },
    { value: 'insight', label: '💡 Personal Insight' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content.trim()) return;

    setIsSubmitting(true);

    try {
      let analysis = null;

      // Try AI analysis if connected
      if (isAIConnected) {
        try {
          const aiResponse = await fetch('http://localhost:3001/analyze-fragment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
          
          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            analysis = aiData.analysis;
          }
        } catch (error) {
          console.log('AI analysis failed, using fallback');
        }
      }

      // Fallback analysis
      if (!analysis) {
        analysis = {
          sentiment: 'neutral',
          topics: formData.content.toLowerCase().split(' ').slice(0, 3),
          confidence: 60,
          processed_at: new Date().toISOString()
        };
      }

      const newMemory = {
        id: Date.now(),
        ...formData,
        analysis,
        timestamp: new Date().toISOString(),
        author: 'Anonymous' // In real app, would be from wallet
      };

      // TODO: Submit to smart contract
      
      onNewMemory(newMemory);
      setLastAnalysis(analysis);
      
      // Reset form
      setFormData({ content: '', category: 'payment', location: '' });

    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Brain className="w-16 h-16 text-bitcoin mx-auto mb-4 animate-bounce-slow" />
        <h2 className="text-3xl font-bold text-white mb-2">Share Your Bitcoin Memory</h2>
        <p className="text-gray-300">
          Every experience you share makes Bitcoin's collective intelligence stronger
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Memory Content */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Bitcoin Experience
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Tell us about your Bitcoin experience... (e.g., 'Just bought coffee with Bitcoin at local cafe - transaction was instant!')"
            className="w-full h-32 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-bitcoin focus:ring-1 focus:ring-bitcoin outline-none resize-none"
            maxLength={280}
          />
          <div className="text-right text-sm text-gray-400 mt-1">
            {formData.content.length}/280
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:border-bitcoin focus:ring-1 focus:ring-bitcoin outline-none"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value} className="bg-gray-800">
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Location (Optional)
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Seattle, WA or just 'Coffee Shop'"
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-bitcoin focus:ring-1 focus:ring-bitcoin outline-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!formData.content.trim() || isSubmitting}
          className="w-full bitcoin-gradient text-black font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 hover:scale-105"
        >
          {isSubmitting ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              {isAIConnected ? 'AI Analyzing...' : 'Processing...'}
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Share Memory
            </>
          )}
        </button>
      </form>

      {/* Last Analysis Display */}
      {lastAnalysis && (
        <div className="memory-card ai-glow">
          <div className="flex items-center mb-3">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            <h3 className="font-semibold text-green-400">Memory Analyzed!</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Sentiment:</span>
              <div className={`font-semibold capitalize ${
                lastAnalysis.sentiment === 'positive' ? 'text-green-400' :
                lastAnalysis.sentiment === 'negative' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {lastAnalysis.sentiment}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Confidence:</span>
              <div className="font-semibold text-bitcoin">{lastAnalysis.confidence}%</div>
            </div>
            <div>
              <span className="text-gray-400">Topics:</span>
              <div className="font-semibold text-purple-400">
                {lastAnalysis.topics?.slice(0, 2).join(', ') || 'bitcoin'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemorySubmission;
