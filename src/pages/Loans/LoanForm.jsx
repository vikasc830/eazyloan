import React, { useState, useEffect } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
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
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Validation functions
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    switch (name) {
      case 'loanid':
        if (!value.trim()) {
          newErrors.loanid = 'Loan ID is required';
        } else if (value.length < 3) {
          newErrors.loanid = 'Loan ID must be at least 3 characters';
        } else {
          delete newErrors.loanid;
        }
        break;
      case 'customerName':
        if (!value.trim()) {
          newErrors.customerName = 'Customer name is required';
        } else if (value.length < 2) {
          newErrors.customerName = 'Customer name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          newErrors.customerName = 'Customer name should only contain letters and spaces';
        } else {
          delete newErrors.customerName;
        }
        break;
      case 'relationName':
        if (!value.trim()) {
          newErrors.relationName = 'Relation name is required';
        } else if (value.length < 2) {
          newErrors.relationName = 'Relation name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          newErrors.relationName = 'Relation name should only contain letters and spaces';
        } else {
          delete newErrors.relationName;
        }
        break;
      case 'phoneNumber':
        if (!value.trim()) {
          newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(value.replace(/\s+/g, ''))) {
          newErrors.phoneNumber = 'Please enter a valid 10-digit Indian mobile number';
        } else {
          delete newErrors.phoneNumber;
        }
        break;
      case 'address':
        if (!value.trim()) {
          newErrors.address = 'Address is required';
        } else if (value.length < 10) {
          newErrors.address = 'Address must be at least 10 characters';
        } else {
          delete newErrors.address;
        }
        break;
      case 'goldWeight':
        if (formData.ornamentType === 'gold' || formData.ornamentType === 'both') {
          if (!value || parseFloat(value) <= 0) {
            newErrors.goldWeight = 'Gold weight must be greater than 0';
          } else if (parseFloat(value) > 1000) {
            newErrors.goldWeight = 'Gold weight seems too high (max 1000g)';
          } else {
            delete newErrors.goldWeight;
          }
        } else {
          // Not required, so clear error
          delete newErrors.goldWeight;
        }
        break;
      case 'silverWeight':
        if (formData.ornamentType === 'silver' || formData.ornamentType === 'both') {
          if (!value || parseFloat(value) <= 0) {
            newErrors.silverWeight = 'Silver weight must be greater than 0';
          } else if (parseFloat(value) > 5000) {
            newErrors.silverWeight = 'Silver weight seems too high (max 5000g)';
          } else {
            delete newErrors.silverWeight;
          }
        } else {
          // Not required, so clear error
          delete newErrors.silverWeight;
        }
        break;
      case 'loanAmount':
        if (!value || parseFloat(value) <= 0) {
          newErrors.loanAmount = 'Loan amount must be greater than 0';
        } else if (parseFloat(value) > estimatedValue) {
          newErrors.loanAmount = 'Loan amount cannot exceed estimated ornament value';
        } else if (parseFloat(value) < 1000) {
          newErrors.loanAmount = 'Minimum loan amount is ₹1,000';
        } else {
          delete newErrors.loanAmount;
        }
        break;
      case 'interestRate':
        if (!value || parseFloat(value) <= 0) {
          newErrors.interestRate = 'Interest rate must be greater than 0';
        } else if (parseFloat(value) > 10) {
          newErrors.interestRate = 'Interest rate seems too high (max 10% per month)';
        } else {
          delete newErrors.interestRate;
        }
        break;
      case 'loanDate':
        if (!value) {
          newErrors.loanDate = 'Loan date is required';
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(today.getFullYear() - 1);
          if (selectedDate > today) {
            newErrors.loanDate = 'Loan date cannot be in the future';
          } else {
            delete newErrors.loanDate;
          }
        }
        break;
      default:
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const fieldsToValidate = [
      'loanid', 'customerName', 'relationName', 'phoneNumber', 'address',
      'loanAmount', 'interestRate', 'loanDate'
    ];
    
    if (formData.ornamentType === 'gold' || formData.ornamentType === 'both') {
      fieldsToValidate.push('goldWeight');
    }
    
    if (formData.ornamentType === 'silver' || formData.ornamentType === 'both') {
      fieldsToValidate.push('silverWeight');
    }
    
    let isValid = true;
    fieldsToValidate.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });
    
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Real-time validation
    validateField(name, value);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form before submission
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    // Convert empty strings to null for optional fields
    const goldWeight = formData.goldWeight === '' ? null : formData.goldWeight;
    const silverWeight = formData.silverWeight === '' ? null : formData.silverWeight;
    const notes = formData.notes === '' ? null : formData.notes;
    const dueDate = formData.dueDate === '' ? null : formData.dueDate;

    // Prepare loan data
    let loanData = {
      LoanId: formData.loanid || null,
      CustomerName: formData.customerName || null,
      RelationName: formData.relationName || null,
      RelationType: formData.relationType || null,
      Title: formData.title || null,
      PhoneNumber: formData.phoneNumber || null,
      Address: formData.address || null,
      OrnamentType: formData.ornamentType || null,
      GoldWeight: goldWeight,
      SilverWeight: silverWeight,
      LoanAmount: formData.loanAmount === '' ? null : formData.loanAmount,
      InterestRate: formData.interestRate === '' ? null : formData.interestRate,
      LoanDate: formData.loanDate || null,
      DueDate: dueDate,
      Notes: notes,
      EstimatedValue: estimatedValue,
      GoldRate: goldRate,
      SilverRate: silverRate,
      Payments: loan ? loan.payments || [] : [] // Preserve existing payments when editing
    };

    // Log payload for debugging
    console.log("Payload sent to API:", loanData);

    // Call parent onSubmit to handle API call
    onSubmit(loanData);
    setIsSubmitting(false);
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
                 required
                 className={errors.loanid ? 'error' : ''}
                 />
                 {errors.loanid && (
                   <div className="error-message">
                     <FaExclamationCircle />
                     <span>{errors.loanid}</span>
                   </div>
                 )}
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
                  className={errors.customerName ? 'error' : ''}
                  required
                />
                {errors.customerName && (
                  <div className="error-message">
                    <FaExclamationCircle />
                    <span>{errors.customerName}</span>
                  </div>
                )}
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
                  className={errors.relationName ? 'error' : ''}
                  required
                />
                {errors.relationName && (
                  <div className="error-message">
                    <FaExclamationCircle />
                    <span>{errors.relationName}</span>
                  </div>
                )}
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
                  className={errors.phoneNumber ? 'error' : ''}
                  placeholder="Enter 10-digit mobile number"
                  required
                />
                {errors.phoneNumber && (
                  <div className="error-message">
                    <FaExclamationCircle />
                    <span>{errors.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={errors.address ? 'error' : ''}
                rows="3"
                placeholder="Enter complete address"
                required
              />
              {errors.address && (
                <div className="error-message">
                  <FaExclamationCircle />
                  <span>{errors.address}</span>
                </div>
              )}
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
                  className={errors.goldWeight ? 'error' : ''}
                  step="0.01"
                  placeholder="Enter weight in grams"
                  required
                />
                {errors.goldWeight && (
                  <div className="error-message">
                    <FaExclamationCircle />
                    <span>{errors.goldWeight}</span>
                  </div>
                )}
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
                  className={errors.silverWeight ? 'error' : ''}
                  step="0.01"
                  placeholder="Enter weight in grams"
                  required
                />
                {errors.silverWeight && (
                  <div className="error-message">
                    <FaExclamationCircle />
                    <span>{errors.silverWeight}</span>
                  </div>
                )}
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
                  className={errors.loanAmount ? 'error' : ''}
                  placeholder="Enter loan amount"
                  required
                />
                {errors.loanAmount && (
                  <div className="error-message">
                    <FaExclamationCircle />
                    <span>{errors.loanAmount}</span>
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label>Interest Rate (% per month)</label>
                <input
                  type="number"
                  name="interestRate"
                  value={formData.interestRate}
                  onChange={handleInputChange}
                  className={errors.interestRate ? 'error' : ''}
                  step="0.1"
                  placeholder="Enter rate (e.g., 3.0)"
                  required
                />
                {errors.interestRate && (
                  <div className="error-message">
                    <FaExclamationCircle />
                    <span>{errors.interestRate}</span>
                  </div>
                )}
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
                  className={errors.loanDate ? 'error' : ''}
                  required
                />
                {errors.loanDate && (
                  <div className="error-message">
                    <FaExclamationCircle />
                    <span>{errors.loanDate}</span>
                  </div>
                )}
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
            <button 
              type="submit" 
              className="btn-submit"
              disabled={isSubmitting || Object.keys(errors).length > 0}
            >
              {isSubmitting ? 'Saving...' : (loan ? 'Update Loan' : 'Add Loan')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanForm;