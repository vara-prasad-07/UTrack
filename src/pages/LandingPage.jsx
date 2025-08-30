import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from "firebase/auth";
import Hero from '../components/ui/neural-network-hero';
import FeaturesSection from '../components/ui/features-section';
import Footer from '../components/ui/footer';

export default function LandingPage() {
  const navigate = useNavigate();
  const [videoEnded, setVideoEnded] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserLoggedIn(!!user);
    });
  
    return () => unsubscribe();
  }, []);

  const handleVideoEnd = () => {
    setVideoEnded(true);
  };

  useEffect(() => {
    if (videoEnded) {
      if (isUserLoggedIn) {
        navigate("/dashboard");
      }
    }
  }, [videoEnded, isUserLoggedIn, navigate]);

  // Handle navigation for CTA buttons
  const handleNavigation = (href) => {
    if (href === '/login') {
      navigate('/login');
    } else if (href === '/signup') {
      navigate('/signup');
    }
  };

  return (
    <>
      {!videoEnded ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "black",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <video
            src="https://res.cloudinary.com/diryolcmm/video/upload/v1753462614/UTrack_1_b3bzav.mp4"
            autoPlay
            muted
            onEnded={handleVideoEnd}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      ) : isUserLoggedIn ? null : (
        <>
          {/* Hero Section - Full Width */}
          <Hero 
            title="Track. Secure. Achieve."
            description="UTrack a comprehensive financial companion that combines advanced security with intelligent tracking to help you reach your financial goals"
            badgeText="AI-Powered Financial Platform"
            badgeLabel="New"
            ctaButtons={[
              { 
                text: "Sign In", 
                href: "/login", 
                primary: true,
                onClick: () => handleNavigation('/login')
              },
              { 
                text: "Create Account", 
                href: "/signup",
                onClick: () => handleNavigation('/signup')
              }
            ]}
            microDetails={["AI‑powered insights", "Bank‑level security", "Real‑time tracking"]}
          />
          
          {/* Content Container */}
          <div className="w-screen min-h-screen overflow-x-hidden">
            {/* Features Section */}
            <div id="features">
              <FeaturesSection />
            </div>
            
            {/* Footer */}
            <Footer />
          </div>
        </>
      )}
    </>
  );
}