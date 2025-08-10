import React, { useState } from 'react';
import axios from 'axios';

interface ActivationForm {
  accountNo: string;
  ifscCode: string;
  branch: string;
  accountType: string;
  nomineeName?: string;
  nomineeRelation?: string;
}

export default function AccountActivation() {
  const [formData, setFormData] = useState<ActivationForm>({
    accountNo: '',
    ifscCode: '',
    branch: '',
    accountType: 'savings',
    nomineeName: '',
    nomineeRelation: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:5000/api';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/user/activate-account`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSuccess('Account activated successfully! You can now get personalized banking assistance.');
        setFormData({
          accountNo: '',
          ifscCode: '',
          branch: '',
          accountType: 'savings',
          nomineeName: '',
          nomineeRelation: ''
        });
      } else {
        setError(response.data.message || 'Failed to activate account');
      }
    } catch (err: any) {
      console.error('Activation error:', err);
      setError(err.response?.data?.message || 'An error occurred during account activation');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return formData.accountNo.trim() && 
           formData.ifscCode.trim() && 
           formData.branch.trim() && 
           formData.accountType;
  };

  return (
    <div className="activation-container">
      <div className="activation-card">
        <div className="activation-header">
          <h1>🔐 Account Activation</h1>
          <p>Link your bank account to get personalized banking assistance</p>
        </div>

        {success && (
          <div className="success">
            <p>✅ {success}</p>
          </div>
        )}

        {error && (
          <div className="error">
            <p>❌ {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="activation-form">
          <div className="form-section">
            <h3>🏦 Account Details</h3>
            
            <div className="form-group">
              <label htmlFor="accountNo">Account Number *</label>
              <input
                type="text"
                id="accountNo"
                name="accountNo"
                value={formData.accountNo}
                onChange={handleInputChange}
                placeholder="Enter your account number"
                required
                pattern="[0-9]+"
                title="Please enter a valid account number (numbers only)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="ifscCode">IFSC Code *</label>
              <input
                type="text"
                id="ifscCode"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleInputChange}
                placeholder="Enter IFSC code"
                required
                pattern="[A-Z]{4}0[A-Z0-9]{6}"
                title="Please enter a valid IFSC code (e.g., SBIN0001234)"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="branch">Branch Name *</label>
              <input
                type="text"
                id="branch"
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                placeholder="Enter branch name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="accountType">Account Type *</label>
              <select
                id="accountType"
                name="accountType"
                value={formData.accountType}
                onChange={handleInputChange}
                required
              >
                <option value="savings">Savings Account</option>
                <option value="current">Current Account</option>
                <option value="fixed">Fixed Deposit</option>
                <option value="recurring">Recurring Deposit</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>👤 Nominee Information (Optional)</h3>
            <p className="section-description">
              Adding nominee information helps in account management and emergency situations
            </p>
            
            <div className="form-group">
              <label htmlFor="nomineeName">Nominee Name</label>
              <input
                type="text"
                id="nomineeName"
                name="nomineeName"
                value={formData.nomineeName}
                onChange={handleInputChange}
                placeholder="Enter nominee name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="nomineeRelation">Relationship with Nominee</label>
              <select
                id="nomineeRelation"
                name="nomineeRelation"
                value={formData.nomineeRelation}
                onChange={handleInputChange}
              >
                <option value="">Select relationship</option>
                <option value="spouse">Spouse</option>
                <option value="parent">Parent</option>
                <option value="child">Child</option>
                <option value="sibling">Sibling</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="activate-btn"
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? 'Activating...' : 'Activate Account'}
            </button>
          </div>
        </form>

        <div className="activation-info">
          <div className="info-box">
            <h3>ℹ️ Why Activate Your Account?</h3>
            <ul>
              <li>Get personalized banking assistance based on your account</li>
              <li>Receive account-specific information and updates</li>
              <li>Access transaction history and balance inquiries</li>
              <li>Get tailored recommendations for banking services</li>
            </ul>
          </div>

          <div className="info-box">
            <h3>🔒 Security Notice</h3>
            <ul>
              <li>Your account information is encrypted and secure</li>
              <li>We never store sensitive banking credentials</li>
              <li>All data transmission is protected with SSL encryption</li>
              <li>You can deactivate account linking anytime</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
