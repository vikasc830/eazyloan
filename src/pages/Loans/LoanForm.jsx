import React, { useState, useEffect } from 'react';
import './LoanForm.css';

const LoanForm = ({ loan, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    loanid:'',
    customerName: '',
    relationName: '',
    relationType: 'father', // father, husband
    title: 'Mr', // Mr, Mrs
    phoneNumber: '',
    address: '',
    ornamentType: 'gold', // gold, silver, both
    goldWeight: '',
    silverWeight: '',
    loanAmount: '',
    interestRate: '3', // default 3% per month
    loanDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: ''
  });

  const [goldRate, setGoldRate] = useState(9800); // Default gold rate per gram
  const [silverRate, setSilverRate] = useState(1080); // Default silver rate per gram
  const [estimatedValue, setEstimatedValue] = useState(0);

  useEffect(() => {
    if (loan) {
      setFormData(loan);
    }
  }, [loan]);

  // Auto-calculate due date when loan date changes
  useEffect(() => {
    if (formData.loanDate) {
      const loanDate = new Date(formData.loanDate);
      const dueDate = new Date(loanDate);
      dueDate.setMonth(dueDate.getMonth() + 11);
      
      setFormData(prev => ({
        ...prev,
        dueDate: dueDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.loanDate]);
  useEffect(() => {
    const calculateValue = () => {
      let total = 0;
      
      if (formData.ornamentType === 'gold' || formData.ornamentType === 'both') {
        total += (parseFloat(formData.goldWeight) || 0) * goldRate*75/100;
      }
      
      if (formData.ornamentType === 'silver' || formData.ornamentType === 'both') {
        total += (parseFloat(formData.silverWeight) || 0) * silverRate*65/100;
      }
      
      setEstimatedValue(total);
    };
    
    calculateValue();
  }, [formData.goldWeight, formData.silverWeight, formData.ornamentType, goldRate, silverRate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const loanData = {
      ...formData,
      estimatedValue,
      goldRate,
      silverRate,
      id: loan?.id || Date.now().toString()
    };
    
    onSubmit(loanData);
  };

  return (
    <div className="loan-form-overlay">
      <div className="loan-form-container">
        <div className="loan-form-header">
          <h2>{loan ? 'Update Loan' : 'Add New Loan'}</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="loan-form">
          {/* Customer Information */}
          <div className="form-section">
            <h3>Loan ID Information</h3>
            <div className='form-row'>
              <div className='form-group'>
                 <label>Loan ID</label>
                 <input type='text'
                 name="loanid"
                 value={formData.loanid}
                 onChange={handleInputChange}
                 required/>
              </div>
            </div>
            <h3>Customer Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Title</label>
                <select 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange}
                  required
                >
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                </select>
              </div>
              
              <div className="form-group flex-2">
                <label>Customer Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Relation</label>
                <select 
                  name="relationType" 
                  value={formData.relationType} 
                  onChange={handleInputChange}
                  required
                >
                  <option value="father">{formData.title === 'Mrs' ? 'Husband' : 'Father'}</option>
                  <option value="husband">Husband</option>
                </select>
              </div>
              
              <div className="form-group flex-2">
                <label>{formData.relationType === 'father' ? 'Father Name' : 'Husband Name'}</label>
                <input
                  type="text"
                  name="relationName"
                  value={formData.relationName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                required
              />
            </div>
          </div>

          {/* Ornament Details */}
          <div className="form-section">
            <h3>Ornament Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Current Gold Rate (per gram)</label>
                <input
                  type="number"
                  value={goldRate}
                  onChange={(e) => setGoldRate(parseFloat(e.target.value) || 0)}
                  step="0.01"
                />
              </div>
              
              <div className="form-group">
                <label>Current Silver Rate (per gram)</label>
                <input
                  type="number"
                  value={silverRate}
                  onChange={(e) => setSilverRate(parseFloat(e.target.value) || 0)}
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Ornament Type</label>
              <select 
                name="ornamentType" 
                value={formData.ornamentType} 
                onChange={handleInputChange}
                required
              >
                <option value="gold">Gold Only</option>
                <option value="silver">Silver Only</option>
                <option value="both">Both Gold & Silver</option>
              </select>
            </div>

            {(formData.ornamentType === 'gold' || formData.ornamentType === 'both') && (
              <div className="form-group">
                <label>Gold Weight (grams)</label>
                <input
                  type="number"
                  name="goldWeight"
                  value={formData.goldWeight}
                  onChange={handleInputChange}
                  step="0.01"
                  required
                />
              </div>
            )}

            {(formData.ornamentType === 'silver' || formData.ornamentType === 'both') && (
              <div className="form-group">
                <label>Silver Weight (grams)</label>
                <input
                  type="number"
                  name="silverWeight"
                  value={formData.silverWeight}
                  onChange={handleInputChange}
                  step="0.01"
                  required
                />
              </div>
            )}

            <div className="estimated-value">
              <strong>Estimated Ornament Value: ₹{estimatedValue.toLocaleString()}</strong>
            </div>
          </div>

          {/* Loan Details */}
          <div className="form-section">
            <h3>Loan Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Loan Amount (₹)</label>
                <input
                  type="number"
                  name="loanAmount"
                  value={formData.loanAmount}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Interest Rate (% per month)</label>
                <input
                  type="number"
                  name="interestRate"
                  value={formData.interestRate}
                  onChange={handleInputChange}
                  step="0.1"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Loan Date</label>
                <input
                  type="date"
                  name="loanDate"
                  value={formData.loanDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Additional notes about the loan..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              {loan ? 'Update Loan' : 'Add Loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanForm;