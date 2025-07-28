import React, { useState, useRef, useEffect } from 'react';
import BottomNav from '../components/BottomNav';
import './PageStyles.css';
import CustomSpinner from '../components/CustomSpinner';
import './ScanPage.css'
import {auth,db} from '../firebase'
import { doc, updateDoc,arrayUnion } from "firebase/firestore";
import { useNavigate} from 'react-router-dom';

const Scan = () => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [loading,setLoading]=useState(false);
  const [htmlTable, setHtmlTable] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [jsonData,setJsonData]=useState(null);
  const [isBillSaved,setIisBillSaved]=useState(false);
  const navigate=useNavigate();
  const uid=auth.currentUser.uid;
 
  // Handle file upload from device storage
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setImageFile(file);
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
      setImageFile(file);
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
    setHtmlTable(null);
    setImageFile(null);
  };

  const handleResult = async () => {
    if (!imageFile) {
      alert('No image file to process.');
      return;
    }
    setLoading(true);
    setHtmlTable(null);
    try {
      const formData = new FormData();
      formData.append('bill_image', imageFile);
      const response = await fetch('https://bill-generator-m5du.onrender.com/process-bill', {
        method: 'POST',
        body: formData,
      });
      setLoading(false);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.data) {
        setHtmlTable(data.data.html_table);
        setJsonData(data.data.json);
      } else {
        setHtmlTable('<div style="color:red">No table found in response.</div>');
      }
    } catch (error) {
      setLoading(false);
      setHtmlTable('<div style="color:red">Error processing bill.</div>');
      console.error('Error:', error);
    }
  };
  const saveBill=async ()=>{
    
    try{
      const userRef=doc(db,"users",uid)
      setLoading(true);
      await updateDoc(userRef,{
        user_bills:arrayUnion({json:jsonData,html:htmlTable})
      })
      console.log("clicked")
      setLoading(false)
      setIisBillSaved(true)
    }catch(error){
      console.log("error in updating db",error)
      setLoading(false)
    }
  }
  const handleBack=()=>{
    setCapturedImage(false)
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
        <>
          {!isBillSaved &&!htmlTable && (
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
          {!isBillSaved && htmlTable && (
            
            <div className="html-table-preview" style={{marginTop: '2rem', background: '#222', borderRadius: 8, padding: 16}}>
              <h2>Your Virtual Bill</h2>
              <div dangerouslySetInnerHTML={{ __html: htmlTable }} />
              <div className="image-actions">
                <button className="action-button secondary" onClick={resetScan}>
                  Scan Again
                </button>
                <button className="action-button primary" onClick={saveBill}>
                  Save
                </button>
              </div>
            </div>
          )}
          {isBillSaved &&(
            <div className="html-table-preview" style={{marginTop: '2rem', background: '#222', borderRadius: 8, padding: 16}}>
              <h2>Bill saved</h2>
              <div className="image-actions">
                <button className="action-button secondary" onClick={handleBack}>
                  Back
                </button>
                
              </div>
            </div>
          )}
        </>
      )}
      
      <BottomNav />
    </div>
  );
};

export default Scan;