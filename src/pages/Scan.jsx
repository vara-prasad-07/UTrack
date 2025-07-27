import React, { useState, useRef } from 'react';
import BottomNav from '../components/BottomNav';
import './PageStyles.css';
import CustomSpinner from '../components/CustomSpinner';

const Scan = () => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [loading,setLoading]=useState(false);

  // Handle file upload from device storage
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle camera capture
  const handleCameraCapture = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
        setIsCapturing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Trigger camera
  const triggerCamera = () => {
    setIsCapturing(true);
    cameraInputRef.current?.click();
  };

  // Reset to upload screen
  const resetScan = () => {
    setCapturedImage(null);
    setIsCapturing(false);
  };
  const handleResult=()=>{
     setLoading(true);
     setTimeout(()=>{
      setLoading(false);
     },2000)
  }
  return (
    <div className="page scan-page">
      {!capturedImage ? (
        <div className="scan-upload-container">
          {/* Upload Bills Section */}
          <div className="upload-section" onClick={triggerFileUpload}>
            <div className="upload-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <h2 className="upload-title">Upload bills</h2>
            <p className="upload-subtitle">supports .jpg, .png</p>
          </div>

          {/* OR Divider */}
          <div className="divider-section">
            <span className="divider-text">OR</span>
          </div>

          {/* Scan with Camera Button */}
          <button className="camera-button" onClick={triggerCamera}>
            <span className="camera-icon">📷</span>
            Scan with Camera
          </button>

          {/* Hidden file inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/jpeg,image/png"
            style={{ display: 'none' }}
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleCameraCapture}
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        /* Display captured/uploaded image */
        <div className="image-preview-container">
          {loading && <CustomSpinner/>}
          <div className="image-preview-header">
            <button className="back-button" onClick={resetScan}>
              ← Back
            </button>
            <h2>Scanned Image</h2>
          </div>
          <div className="image-preview">
            <img src={capturedImage} alt="Scanned bill" className="scanned-image" />
          </div>
          <div className="image-actions">
            <button className="action-button secondary" onClick={resetScan}>
              Scan Again
            </button>
            <button className="action-button primary" onClick={handleResult}>
              Process Bill
            </button>
          </div>
        </div>
      )}
      
      <BottomNav />

      <style jsx>{`
        .scan-page {
          background-color: #000;
          color: #fff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 20px;
          padding-bottom: 80px; /* Space for bottom nav */
        }

        .scan-upload-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 40px;
          max-width: 400px;
          margin: 0 auto;
        }

        .upload-section {
          border: 2px dashed #333;
          border-radius: 12px;
          padding: 60px 40px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.3s ease;
          width: 100%;
        }

        .upload-section:hover {
          border-color: #555;
        }

        .upload-icon {
          margin-bottom: 20px;
          color: #fff;
        }

        .upload-icon svg {
          transform: rotate(180deg);
        }

        .upload-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #fff;
        }

        .upload-subtitle {
          color: #888;
          font-size: 14px;
        }

        .divider-section {
          position: relative;
          width: 100%;
          text-align: center;
        }

        .divider-text {
          background-color: #000;
          padding: 0 20px;
          color: #888;
          font-size: 14px;
          position: relative;
        }

        .divider-text::before {
          content: '';
          position: absolute;
          top: 50%;
          left: -150px;
          right: -150px;
          height: 1px;
          background-color: #333;
          z-index: -1;
        }

        .camera-button {
          background-color: #007AFF;
          border: none;
          border-radius: 12px;
          padding: 16px 24px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          justify-content: center;
          transition: background-color 0.3s ease;
        }

        .camera-button:hover {
          background-color: #0056CC;
        }

        .camera-icon {
          font-size: 20px;
        }

        .image-preview-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          max-width: 500px;
          margin: 0 auto;
          width: 100%;
        }

        .image-preview-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .back-button {
          background: none;
          border: none;
          color: #007AFF;
          font-size: 16px;
          cursor: pointer;
          padding: 8px;
        }

        .image-preview-header h2 {
          color: #fff;
          font-size: 20px;
          font-weight: 600;
        }

        .image-preview {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 5px;
          border-radius: 12px;
          overflow: hidden;
          background-color: #111;
        }

        .scanned-image {
          max-width: 60%;
          max-height: 40vh;
          object-fit: contain;
          border-radius: 8px;
        }

        .image-actions {
          display: flex;
          gap: 12px;
          margin-bottom:4rem;
          margin-top:10px;
        }

        .action-button {
          flex: 1;
          padding: 16px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.3s ease;
        }

        .action-button.secondary {
          background-color: #333;
          color: #fff;
        }

        .action-button.secondary:hover {
          background-color: #444;
        }

        .action-button.primary {
          background-color: #007AFF;
          color: #fff;
        }

        .action-button.primary:hover {
          background-color: #0056CC;
        }

        @media (max-width: 480px) {
          .scan-page {
            padding: 16px;
          }
          
          .upload-section {
            padding: 40px 20px;
          }
          
          .divider-text::before {
            left: -100px;
            right: -100px;
          }
        }
      `}</style>
    </div>
  );
};

export default Scan;