"use client";
import React, { useState, useEffect } from 'react';
import styles from './TransferModal.module.css';
import { Send, User, CreditCard, X, CheckCircle, AlertCircle } from 'lucide-react';

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
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {isSuccess ? (
          <div className={styles.successWrapper}>
            <CheckCircle size={64} className={styles.successIcon} />
            <h4 className={styles.successTitle}>Transfer Successful!</h4>
            <p className={styles.successText}>
              Your funds have been securely transferred to the recipient.
            </p>
            <button className={styles.primaryBtn} style={{width: '100%'}} onClick={handleClose}>
              Return to Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className={styles.modalHeader}>
              <h4 className={styles.modalTitle}>Transfer Funds</h4>
              <button onClick={handleClose} className={styles.closeBtn}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.balanceBox}>
                <span className={styles.balanceLabel}>Swift Balance Available</span>
                <div className={styles.balanceValue}>
                  {currentSwiftBalance.toFixed(4)} USDT
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Recipient Email</label>
                  <input
                    type="email"
                    className={styles.textInput}
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="recipient@example.com"
                    required
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Transfer Amount (USDT)</label>
                  <input
                    type="number"
                    step="0.000001"
                    className={styles.amountInput}
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                  <div className={styles.percentageGrid}>
                    {[0.25, 0.5, 0.75, 1].map((p) => (
                        <button
                        key={p}
                        type="button"
                        className={styles.percentageBtn}
                        onClick={() => setTransferAmount((currentSwiftBalance * p).toFixed(6))}
                        >
                        {p === 1 ? "MAX" : `${p * 100}%`}
                        </button>
                    ))}
                  </div>
                </div>

                {(error || formError) && (
                  <div className={styles.errorBox}>
                    {error || formError}
                  </div>
                )}

                <div className={styles.buttonRow}>
                    <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isLoading || !transferAmount || parseFloat(transferAmount) <= 0 || parseFloat(transferAmount) > currentSwiftBalance || !recipientEmail}
                    >
                        {isLoading ? 'Processing...' : 'Send Transfer'}
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
