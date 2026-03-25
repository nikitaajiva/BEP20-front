import React from 'react';
import styles from './report.module.css';

const ReportPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <i className={`ri-line-chart-line ${styles.icon}`}></i>
        <h1 className={styles.title}>Report Page Coming Soon</h1>
        <p className={styles.subtitle}>
          We are working hard to bring you detailed reports and analytics. Please check back later!
        </p>
        <a href="/dashboard" className={styles.backButton}>
          <i className="ri-arrow-left-line"></i>
          Back to Dashboard
        </a>
      </div>
    </div>
  );
};

export default ReportPage; 