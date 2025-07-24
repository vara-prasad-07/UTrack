import React from 'react';
import BottomNav from '../components/BottomNav';
import './PageStyles.css';

const Scan = () => {
  return (
    <div className="page scan-page">
      <div className="header">scan</div>
      <div className="scan-center">
        <div className="upload-box">
          <div className="upload-arrow">↑</div>
          <div>Upload bills</div>
          <div className="upload-support">supports .jpg, .png</div>
        </div>
        <div className="or-divider">OR</div>
        <button className="scan-btn">Scan with Camera</button>
      </div>
      <BottomNav />
    </div>
  );
};

export default Scan; 