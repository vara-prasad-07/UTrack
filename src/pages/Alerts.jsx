import React from 'react';
import BottomNav from '../components/BottomNav';
import './PageStyles.css';

const Alerts = () => {
  return (
    <div className="page alerts-page">
      <div className="header">Alerts</div>
      <div className="placeholder-center">No alerts yet.</div>
      <BottomNav />
    </div>
  );
};

export default Alerts; 