import React from "react";
import styles from "./SuccessModal.module.css";
import { CheckCircle, X, ExternalLink } from "lucide-react";

export default function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  transactionHash,
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className={styles.closeBtn}>
          <X size={24} />
        </button>

        <CheckCircle size={64} className={styles.successIcon} />
        
        <h4 className={styles.title}>{title || "Transaction Success"}</h4>
        <p className={styles.message}>{message || "Your transaction has been processed successfully."}</p>

        {transactionHash && (
          <div className={styles.hashBox}>
            <span className={styles.hashLabel}>Transaction Hash</span>
            <a
              href={`https://xrpscan.com/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.hashLink}
            >
              {transactionHash} <ExternalLink size={12} style={{ marginLeft: 4, display: "inline" }} />
            </a>
          </div>
        )}

        <button onClick={onClose} className={styles.actionBtn}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
