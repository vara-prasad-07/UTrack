// src/components/GoogleLoginButton.js
import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import { getAdditionalUserInfo } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

function GoogleLoginButton() {
  const navigate=useNavigate();  
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const additionalDetails=getAdditionalUserInfo(result);
      localStorage.setItem("user",JSON.stringify(user))
      const isnewuser=additionalDetails.isNewUser;
      isnewuser? navigate('/setup'):navigate('/dashboard')

      console.log("User Info:", user);
      // Redirect or update UI accordingly
    } catch (error) {
      console.error("Google Sign-In Error", error);
    }
  };

  return (
    <button
    type="button"
    className="btn w-100 d-flex align-items-center justify-content-center mb-4"
    onClick={handleGoogleLogin}
    style={{
      height: '50px',
      fontSize: '16px',
      fontWeight: '600',
      backgroundColor: '#e9ecef',
      border: 'none',
      borderRadius: '25px',
      color: '#333'
    }}
  >
    <span className="me-2">Continue With</span>
    <div 
      className="rounded-circle d-flex align-items-center justify-content-center"
      style={{
        width: '24px',
        height: '24px',
        backgroundColor: '#fff',
        border: '1px solid #ddd'
      }}
    >
      <span style={{fontSize: '14px', fontWeight: 'bold', color: '#4285f4'}}>G</span>
    </div>
  </button>
  );
}

export default GoogleLoginButton;
