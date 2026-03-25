"use client";
import React, { useState, useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const TransferModal = ({ isOpen, onClose, onSubmit, currentSwiftBalance, isLoading, error, isSuccess }) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [formError, setFormError] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setRecipientEmail('');
      setTransferAmount('');
      setFormError('');
    }
  }, [isOpen]);

  // Clear form error on input change
  useEffect(() => {
    if (formError) {
      setFormError('');
    }
  }, [recipientEmail, transferAmount]);


  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!recipientEmail || !/\S+@\S+\.\S+/.test(recipientEmail)) {
      setFormError('Please enter a valid recipient email.');
      return;
    }
    
    const amount = parseFloat(transferAmount);
    if (!transferAmount || amount <= 0) {
      setFormError('Please enter a valid transfer amount.');
      return;
    }

    if (amount > currentSwiftBalance) {
      setFormError('Transfer amount cannot exceed your Swift balance.');
      return;
    }

    onSubmit({ recipientEmail, amount });
  };

  const handleClose = () => {
    setRecipientEmail('');
    setTransferAmount('');
    setFormError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1050
    }}>
      <div className="modal-content" style={{
        background: '#181f3a',
        borderRadius: '22px',
        padding: '2rem',
        width: '90%',
        maxWidth: '500px',
        color: 'white',
        boxShadow: '0 8px 32px 0 rgba(16,25,53,0.18)',
        textAlign: isSuccess ? 'center' : 'left'
      }}>
        {isSuccess ? (
          <div>
            <FaCheckCircle size={50} style={{ color: '#28a745', marginBottom: '1rem' }} />
            <h4 style={{ margin: '0 0 1rem 0', color: '#fff' }}>Transfer Successful!</h4>
            <p style={{ color: '#b3baff', marginBottom: '2rem' }}>
              Your funds have been sent successfully.
            </p>
            <button
              onClick={handleClose}
              style={{
                background: 'rgba(79, 140, 255, 0.1)',
                border: '1px solid rgba(79, 140, 255, 0.2)',
                color: '#4f8cff',
                borderRadius: '12px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="modal-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, color: '#fff' }}>
                Transfer Swift Balance
              </h4>
              <button 
                onClick={handleClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#b3baff',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <small style={{ color: '#b3baff' }}>Available in Swift Wallet:</small>
                    <div style={{ color: '#4f8cff', fontWeight: 'bold' }}>
                      {currentSwiftBalance.toFixed(6)} USDT
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b3baff' }}>
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="johndoe@example.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(79, 140, 255, 0.2)',
                      background: 'rgba(79, 140, 255, 0.1)',
                      color: '#fff',
                      fontSize: '1rem'
                    }}
                    required
                  />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b3baff' }}>
                    Transfer Amount (USDT)
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    min="0"
                    max={currentSwiftBalance}
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="Enter amount to transfer"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(79, 140, 255, 0.2)',
                      background: 'rgba(79, 140, 255, 0.1)',
                      color: '#fff',
                      fontSize: '1rem'
                    }}
                    required
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setTransferAmount((currentSwiftBalance * 0.25).toFixed(6))}
                      style={{ background: 'rgba(79, 140, 255, 0.1)', border: '1px solid rgba(79, 140, 255, 0.2)', color: '#4f8cff', borderRadius: '8px', padding: '0.25rem 0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      25%
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransferAmount((currentSwiftBalance * 0.5).toFixed(6))}
                      style={{ background: 'rgba(79, 140, 255, 0.1)', border: '1px solid rgba(79, 140, 255, 0.2)', color: '#4f8cff', borderRadius: '8px', padding: '0.25rem 0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransferAmount((currentSwiftBalance * 0.75).toFixed(6))}
                      style={{ background: 'rgba(79, 140, 255, 0.1)', border: '1px solid rgba(79, 140, 255, 0.2)', color: '#4f8cff', borderRadius: '8px', padding: '0.25rem 0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      75%
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransferAmount(currentSwiftBalance.toFixed(6))}
                      style={{ background: 'rgba(79, 140, 255, 0.1)', border: '1px solid rgba(79, 140, 255, 0.2)', color: '#4f8cff', borderRadius: '8px', padding: '0.25rem 0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      Max
                    </button>
                  </div>
                </div>

                {(error || formError) && (
                  <div style={{
                    background: 'rgba(255, 77, 77, 0.1)',
                    border: '1px solid rgba(255, 77, 77, 0.2)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1rem',
                    color: '#ff4d4d'
                  }}>
                    {error || formError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    style={{
                      background: 'rgba(255, 77, 77, 0.1)',
                      border: '1px solid rgba(255, 77, 77, 0.2)',
                      color: '#ff4d4d',
                      borderRadius: '12px',
                      padding: '0.75rem 1.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !transferAmount || parseFloat(transferAmount) <= 0 || parseFloat(transferAmount) > currentSwiftBalance || !recipientEmail}
                    style={{
                      background: 'rgba(79, 140, 255, 0.1)',
                      border: '1px solid rgba(79, 140, 255, 0.2)',
                      color: '#4f8cff',
                      borderRadius: '12px',
                      padding: '0.75rem 1.5rem',
                      cursor: 'pointer',
                      opacity: (isLoading || !transferAmount || parseFloat(transferAmount) <= 0 || parseFloat(transferAmount) > currentSwiftBalance || !recipientEmail) ? 0.5 : 1
                    }}
                  >
                    {isLoading ? 'Processing...' : 'Transfer'}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TransferModal; 
