import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface FAQ {
  _id: string;
  question: string;
  count: number;
  shortAnswer: string;
  longAnswer: string;
}

export default function Awareness() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchFrequentlyAskedQuestions();
  }, []);

  const fetchFrequentlyAskedQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/query/frequently-asked`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setFaqs(response.data.faqs);
      } else {
        setError(response.data.message || 'Failed to fetch FAQs');
      }
    } catch (err: any) {
      console.error('Error fetching FAQs:', err);
      setError(err.response?.data?.message || 'An error occurred while fetching FAQs');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFaq = (faqId: string) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  if (isLoading) {
    return (
      <div className="awareness-container">
        <div className="awareness-card">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading frequently asked questions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="awareness-container">
      <div className="awareness-card">
        <div className="awareness-header">
          <h1>📚 Banking Awareness Center</h1>
          <p>Discover the most frequently asked banking questions and their answers</p>
        </div>

        {error && (
          <div className="error">
            <p>❌ {error}</p>
            <button onClick={fetchFrequentlyAskedQuestions} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        {!error && faqs.length === 0 && (
          <div className="empty-state">
            <p>📝 No frequently asked questions available yet.</p>
            <p>Questions will appear here as users interact with the banking assistant.</p>
          </div>
        )}

        {!error && faqs.length > 0 && (
          <div className="faq-section">
            <div className="faq-header">
              <h2>Frequently Asked Questions</h2>
              <p>Top {faqs.length} questions asked by users</p>
            </div>

            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div key={faq._id} className="faq-item">
                  <div 
                    className="faq-question"
                    onClick={() => toggleFaq(faq._id)}
                  >
                    <div className="faq-rank">
                      <span className="rank-number">#{index + 1}</span>
                      <span className="ask-count">({faq.count} times asked)</span>
                    </div>
                    <h3>{faq.question}</h3>
                    <button className="expand-btn">
                      {expandedFaq === faq._id ? '−' : '+'}
                    </button>
                  </div>
                  
                  {expandedFaq === faq._id && (
                    <div className="faq-answer">
                      <div className="short-answer">
                        <h4>Quick Answer</h4>
                        <p>{faq.shortAnswer}</p>
                      </div>
                      <div className="detailed-answer">
                        <h4>Detailed Explanation</h4>
                        <p>{faq.longAnswer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="awareness-footer">
          <div className="info-box">
            <h3>💡 How it works</h3>
            <p>This page shows the most common banking questions asked by users, sorted by frequency. 
            Click on any question to see both a quick answer and detailed explanation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
