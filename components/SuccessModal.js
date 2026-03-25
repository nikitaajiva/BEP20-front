import React from "react";
import styles from "./SuccessModal.module.css";
import { CheckCircle, X, ExternalLink } from "lucide-react";
import { FaCheckCircle } from "react-icons/fa";
import { getTxUrl } from "@/utils/explorer";

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
            <div style={{ marginBottom: "2rem", wordBreak: "break-all" }}>
              <p
                style={{
                  color: "#b3baff",
                  marginBottom: "0.5rem",
                  fontSize: "0.9rem",
                }}
              >
                Transaction Hash:
              </p>
              <a
                href={getTxUrl(transactionHash)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#4f8cff", textDecoration: "underline" }}
                title="View transaction on USDTL explorer"
              >
                {transactionHash}
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
