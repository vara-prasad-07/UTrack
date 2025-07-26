import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {auth} from '../firebase';
import { onAuthStateChanged } from "firebase/auth";

const carouselData = [
  {
    title: "ENJOY ROBUST",
    subtitle: "SECURITY",
    illustration: "security"
  },
  {
    title: "TRACK YOUR",
    subtitle: "PROGRESS",
    illustration: "progress"
  },
  {
    title: "STAY",
    subtitle: "CONNECTED",
    illustration: "connected"
  },
  {
    title: "ACHIEVE YOUR",
    subtitle: "GOALS",
    illustration: "goals"
  }
];

const SecurityIllustration = () => (
    
  <div className="relative">
    {/* Main cube/box */}
    <div className="relative">
      {/* Top face */}
      <div className="w-16 h-16 bg-cyan-400 transform rotate-45 skew-x-12 skew-y-12 absolute -top-4 left-4"></div>
      {/* Left face */}
      <div className="w-16 h-16 bg-cyan-500 transform -skew-y-12"></div>
      {/* Right face */}
      <div className="w-16 h-16 bg-cyan-600 transform skew-x-12 absolute top-0 left-8"></div>
    </div>
    
    {/* Lock icon */}
    <div className="absolute -top-2 -left-2">
      <div className="w-8 h-10 bg-red-500 rounded-t-lg relative">
        <div className="w-6 h-8 border-4 border-red-500 border-b-0 rounded-t-full absolute -top-2 left-1 bg-transparent"></div>
        <div className="w-2 h-2 bg-white rounded-full absolute bottom-2 left-3"></div>
      </div>
    </div>
    
    {/* Green elements */}
    <div className="absolute -top-6 right-2 w-4 h-4 bg-lime-400 rounded transform rotate-45"></div>
    <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-lime-400 rounded-full"></div>
  </div>
);

const ProgressIllustration = () => (
  <div className="relative">
    {/* Chart bars */}
    <div className="flex items-end space-x-2">
      <div className="w-4 h-8 bg-blue-400 rounded-t"></div>
      <div className="w-4 h-12 bg-blue-500 rounded-t"></div>
      <div className="w-4 h-16 bg-blue-600 rounded-t"></div>
      <div className="w-4 h-10 bg-blue-400 rounded-t"></div>
    </div>
    
    {/* Progress circle */}
    <div className="absolute -top-4 -right-4 w-12 h-12 border-4 border-green-400 rounded-full relative">
      <div className="absolute inset-2 bg-green-400 rounded-full"></div>
      <div className="absolute top-3 left-3 w-2 h-2 bg-white rounded-full"></div>
    </div>
    
    {/* Accent elements */}
    <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-yellow-400 rounded-full"></div>
  </div>
);

const ConnectedIllustration = () => (
  <div className="relative">
    {/* Network nodes */}
    <div className="relative w-20 h-16">
      <div className="absolute top-0 left-4 w-4 h-4 bg-purple-400 rounded-full"></div>
      <div className="absolute top-6 left-0 w-4 h-4 bg-purple-500 rounded-full"></div>
      <div className="absolute top-6 right-0 w-4 h-4 bg-purple-500 rounded-full"></div>
      <div className="absolute bottom-0 left-4 w-4 h-4 bg-purple-600 rounded-full"></div>
      
      {/* Connection lines */}
      <div className="absolute top-2 left-6 w-8 h-0.5 bg-purple-300 transform rotate-45"></div>
      <div className="absolute top-2 left-6 w-8 h-0.5 bg-purple-300 transform -rotate-45"></div>
      <div className="absolute bottom-2 left-2 w-8 h-0.5 bg-purple-300 transform -rotate-45"></div>
      <div className="absolute bottom-2 left-6 w-8 h-0.5 bg-purple-300 transform rotate-45"></div>
    </div>
    
    {/* Signal waves */}
    <div className="absolute -top-2 right-2 w-6 h-6">
      <div className="w-6 h-6 border-2 border-green-400 rounded-full animate-ping"></div>
    </div>
  </div>
);

const GoalsIllustration = () => (
  <div className="relative">
    {/* Target/bullseye */}
    <div className="w-16 h-16 relative">
      <div className="w-16 h-16 border-4 border-red-400 rounded-full"></div>
      <div className="absolute inset-2 border-4 border-red-500 rounded-full"></div>
      <div className="absolute inset-4 bg-red-600 rounded-full"></div>
      
      {/* Arrow */}
      <div className="absolute top-2 right-2 w-6 h-1 bg-yellow-400 transform rotate-45"></div>
      <div className="absolute top-3 right-1 w-2 h-2 border-t-2 border-r-2 border-yellow-400 transform rotate-45"></div>
    </div>
    
    {/* Trophy elements */}
    <div className="absolute -bottom-2 -left-2 w-4 h-6 bg-yellow-400 rounded-t-full"></div>
    <div className="absolute -top-4 right-4 w-3 h-3 bg-lime-400 rounded-full"></div>
  </div>
);

const renderIllustration = (type) => {
  switch (type) {
    case 'security':
      return <SecurityIllustration />;
    case 'progress':
      return <ProgressIllustration />;
    case 'connected':
      return <ConnectedIllustration />;
    case 'goals':
      return <GoalsIllustration />;
    default:
      return <SecurityIllustration />;
  }
};

export default function LandingPage() {

    const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserLoggedIn(!!user); // true if user exists
    });
  
    return () => unsubscribe(); // cleanup on unmount
  }, []);
  const handleVideoEnd = () => {
    setVideoEnded(true);
  };

  useEffect(() => {
    if (videoEnded) {
      if (isUserLoggedIn) {
        navigate("/dashboard"); // redirect AFTER video finishes
      }
      // else do nothing → show landing content
    }
  }, [videoEnded, isUserLoggedIn, navigate]);
  // Auto-advance carousel every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselData.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  const handleSwipe = (direction) => {
    if (direction === 'left') {
      setCurrentSlide((prev) => (prev + 1) % carouselData.length);
    } else if (direction === 'right') {
      setCurrentSlide((prev) => (prev - 1 + carouselData.length) % carouselData.length);
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
      <div className="w-screen h-screen overflow-hidden bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-start p-6 pt-12">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-black rounded-full"></div>
          </div>
          <span className="text-xl font-semibold">UTrack</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {/* Carousel Container */}
        <div className="relative w-full max-w-sm">
          <div 
            className="overflow-hidden"
            onTouchStart={(e) => {
              const touchStart = e.touches[0].clientX;
              e.currentTarget.addEventListener('touchend', (endEvent) => {
                const touchEnd = endEvent.changedTouches[0].clientX;
                const diff = touchStart - touchEnd;
                if (Math.abs(diff) > 50) {
                  handleSwipe(diff > 0 ? 'left' : 'right');
                }
              }, { once: true });
            }}
          >
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {carouselData.map((slide, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <div className="bg-gray-100 rounded-2xl p-8 mb-8 w-full">
                    {/* Illustration */}
                    <div className="flex items-center justify-center mb-6">
                      {renderIllustration(slide.illustration)}
                    </div>
                    
                    <h2 className="text-black text-xl font-bold text-center mb-2">
                      {slide.title}
                    </h2>
                    <h2 className="text-black text-xl font-bold text-center">
                      {slide.subtitle}
                    </h2>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pagination dots */}
        <div className="flex space-x-2 mb-12">
          {carouselData.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                currentSlide === index ? 'bg-white' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="w-full max-w-sm space-y-4">
          <button onClick={()=>{navigate('/login')}} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors">
            Sign In
          </button>
          
          <button onClick={()=>{navigate('/signup')}} className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 rounded-xl transition-colors">
            Create Account
          </button>
        </div>

        {/* Terms */}
        <div className="text-center text-gray-400 text-sm mt-8 px-4">
          By continuing, you agree to UTrack{' '}
          <span className="text-white underline">Terms of Service</span> and{' '}
          <span className="text-white underline">Privacy Policy</span>.
        </div>
      </div>
    </div>
    )}
  </>
    
  );
}