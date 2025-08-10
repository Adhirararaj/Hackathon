import React from 'react';

export default function About() {
  return (
    <div className="about-container">
      <div className="about-card">
        <div className="about-header">
          <h1>ℹ️ About Vaantra Banking Assistant</h1>
          <p>Your intelligent banking companion powered by AI</p>
        </div>

        <div className="about-content">
          <section className="about-section">
            <h2>🤖 What is Vaantra?</h2>
            <p>
              Vaantra is an advanced AI-powered banking assistant designed to provide instant, 
              accurate, and personalized responses to all your banking-related queries. 
              Whether you need help with account management, loan information, or general 
              banking procedures, Vaantra is here to assist you 24/7.
            </p>
          </section>

          <section className="about-section">
            <h2>✨ Key Features</h2>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">🎤</div>
                <h3>Voice Input</h3>
                <p>Ask questions using your voice for hands-free banking assistance</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✏️</div>
                <h3>Text Input</h3>
                <p>Type your questions directly for quick and precise responses</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📄</div>
                <h3>Document Upload</h3>
                <p>Upload documents to get contextual answers and analysis</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🔐</div>
                <h3>Account Integration</h3>
                <p>Link your bank account for personalized responses</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📚</div>
                <h3>Learning Center</h3>
                <p>Access frequently asked questions and banking awareness</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">⚡</div>
                <h3>Instant Responses</h3>
                <p>Get both quick answers and detailed explanations instantly</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>🔧 How It Works</h2>
            <div className="how-it-works">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Input Your Question</h3>
                  <p>Use voice, text, or upload a document with your banking query</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>AI Processing</h3>
                  <p>Our advanced AI analyzes your question and searches through comprehensive banking knowledge</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Get Answers</h3>
                  <p>Receive both a quick summary and detailed explanation tailored to your needs</p>
                </div>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>🛡️ Security & Privacy</h2>
            <div className="security-features">
              <div className="security-item">
                <h3>🔒 End-to-End Encryption</h3>
                <p>All communications are encrypted to protect your sensitive information</p>
              </div>
              <div className="security-item">
                <h3>👤 User Authentication</h3>
                <p>Secure login and session management to ensure only authorized access</p>
              </div>
              <div className="security-item">
                <h3>📊 Data Privacy</h3>
                <p>Your personal information is never shared with third parties</p>
              </div>
              <div className="security-item">
                <h3>🔄 Regular Updates</h3>
                <p>Continuous security updates and monitoring to maintain the highest standards</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>🎯 Supported Topics</h2>
            <div className="topics-grid">
              <div className="topic-category">
                <h3>🏦 Account Management</h3>
                <ul>
                  <li>Account opening procedures</li>
                  <li>Balance inquiries</li>
                  <li>Transaction history</li>
                  <li>Account closure</li>
                </ul>
              </div>
              <div className="topic-category">
                <h3>💳 Cards & Payments</h3>
                <ul>
                  <li>Card application process</li>
                  <li>PIN management</li>
                  <li>Transaction limits</li>
                  <li>Fraud protection</li>
                </ul>
              </div>
              <div className="topic-category">
                <h3>💰 Loans & Credit</h3>
                <ul>
                  <li>Loan eligibility</li>
                  <li>Interest rates</li>
                  <li>EMI calculations</li>
                  <li>Documentation requirements</li>
                </ul>
              </div>
              <div className="topic-category">
                <h3>🌐 Digital Banking</h3>
                <ul>
                  <li>Internet banking setup</li>
                  <li>Mobile app features</li>
                  <li>UPI transactions</li>
                  <li>Online security</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>📞 Support</h2>
            <p>
              If you need additional assistance or have technical issues, our support team is available 
              to help you. You can also visit the Awareness section to find answers to common questions 
              and learn more about banking services.
            </p>
          </section>
        </div>

        <div className="about-footer">
          <p>© 2024 Vaantra Banking Assistant. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
