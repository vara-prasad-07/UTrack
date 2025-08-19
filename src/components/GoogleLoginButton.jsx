// src/components/GoogleLoginButton.js
import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider,db } from "../firebase";
import { getAdditionalUserInfo } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from "firebase/firestore";

function GoogleLoginButton() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const additionalDetails = getAdditionalUserInfo(result);
      const isNewUser = additionalDetails.isNewUser;

      const user_details = {
        userdetails: {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        },
      };

      if (isNewUser) {
        await setDoc(doc(db, "users", user.uid), user_details);
        console.log("New user: document created");
      } else {
        await setDoc(doc(db, "users", user.uid), user_details, { merge: true });
        console.log("Existing user: document updated with merge");
      }

      isNewUser ? navigate("/setup") : navigate("/dashboard");
    } catch (error) {
      console.error("Google Sign-In Error", error);
    }
  }; // ✅ This was likely missing

  return (
    <button
      type="button"
      className="w-full mb-4 h-[50px] text-[16px] font-semibold rounded-full text-[#333] bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
      onClick={handleGoogleLogin}
    >
      <span className="mr-2">Continue With</span>
      <div
        className="rounded-full flex items-center justify-center w-6 h-6 bg-white border border-gray-300"
      >
        <span className="text-[14px] font-bold text-[#4285f4]">G</span>
      </div>
    </button>
  );
}

export default GoogleLoginButton;

