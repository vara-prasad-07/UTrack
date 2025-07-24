import React from 'react';
import BottomNav from '../components/BottomNav';
import './PageStyles.css';

const ScanResult = () => {
  return (
    <div className="page scan-result-page">
      <div className="header">scaned result</div>
      <div className="scan-result-center">
        <div className="bill-label">Your bill</div>
        <div className="bill-image-placeholder">[RECEIPT IMG]</div>
        <div className="bill-total">You spend Total: 1200/-</div>
        <button className="wallet-btn">Save and Link to Google Wallet</button>
      </div>
      <BottomNav />
    </div>
  );
};

export default ScanResult; 