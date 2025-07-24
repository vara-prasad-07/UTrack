import React from 'react';
import BottomNav from '../components/BottomNav';
import './PageStyles.css';

const Ask = () => {
  return (
    <div className="page ask-page">
      <div className="header">ask</div>
      <div className="ask-center">
        <div className="ask-greeting">Hey vara!</div>
        <div className="ask-prompt">Ask me anything about your money — I’m listening.</div>
      </div>
      <div className="ask-input-row">
        <input className="ask-input" placeholder="what is my present spending |" />
      </div>
      <BottomNav />
    </div>
  );
};

export default Ask; 