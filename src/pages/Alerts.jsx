import React, { useEffect, useRef } from 'react';
import BottomNav from '../components/BottomNav';
import './PageStyles.css';

const Alerts = () => {
  const razorpayContainerRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://checkout.razorpay.com/v1/payment-button.js";
    script.setAttribute("data-payment_button_id", "pl_Qz9w79lQBguY8Q");
    script.async = true;

    if (razorpayContainerRef.current) {
      razorpayContainerRef.current.innerHTML = ''; // Clear if re-rendered
      razorpayContainerRef.current.appendChild(script);
    }

    return () => {
      // Cleanup if component unmounts
      if (razorpayContainerRef.current) {
        razorpayContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="page alerts-page">
      <h2 className="text-white d-flex flex-row justify-content-center align-center text-bold">
        Pay with UTrack
      </h2>

      {/* Razorpay Payment Button mounts here */}
      <div ref={razorpayContainerRef}></div>

      <BottomNav />
    </div>
  );
};

export default Alerts;
