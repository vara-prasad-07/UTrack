import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomSpinner from '../components/CustomSpinner';

const Signup = () => {
  const navigate=useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  

  const handleSignup = () => {
    setLoading(true);
    console.log('Signup attempted with:', { 
      email, 
      password, 
      confirmPassword, 
      dateOfBirth, 
      gender 
    });
    setTimeout(()=>{
        navigate('/setup');
    },5000);
    
    
  };

  const handleGoogleSignup = () => {
    console.log('Google signup clicked');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    
    <div className="min-vh-100 d-flex align-items-center justify-content-center " style={{backgroundColor: '#000'}}>
        
      <div className="container-fluid px-3">
        <div className="row justify-content-center">
        <div className="flex items-center justify-start p-6 pt-12">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-black rounded-full"></div>
          </div>
          <span className="text-xl text-white font-semibold">UTrack</span>
        </div>
      </div>
      {loading && <CustomSpinner />}
          <div className="col-12" style={{maxWidth: '400px'}}>
            
    
            {/* Signup Card */}
            <div className="card border-0 shadow-lg" style={{borderRadius: '20px'}}>
              <div className="card-body p-4">
                
                {/* Signup Title */}
                <h3 className="text-center mb-4" style={{fontSize: '32px', fontWeight: '600', color: '#333'}}>
                  Signup
                </h3>

                {/* Email Field */}
                <div className="mb-3">
                  <div className="form-label mb-2" style={{fontSize: '16px', color: '#666', fontWeight: '500'}}>
                    Email Id
                  </div>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      height: '50px',
                      fontSize: '16px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      backgroundColor: '#f8f9fa'
                    }}
                  />
                </div>

                {/* Set Password Field */}
                <div className="mb-3">
                  <div className="form-label mb-2" style={{fontSize: '16px', color: '#666', fontWeight: '500'}}>
                    Set Password
                  </div>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      height: '50px',
                      fontSize: '16px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      backgroundColor: '#f8f9fa'
                    }}
                  />
                </div>

                {/* Confirm Password Field */}
                <div className="mb-3">
                  <div className="form-label mb-2" style={{fontSize: '16px', color: '#666', fontWeight: '500'}}>
                    Confirm Password
                  </div>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Confirm your Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      height: '50px',
                      fontSize: '16px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      backgroundColor: '#f8f9fa'
                    }}
                  />
                </div>

                {/* Date of Birth Field */}
                <div className="mb-3">
                  <div className="form-label mb-2" style={{fontSize: '16px', color: '#666', fontWeight: '500'}}>
                    Date of Birth
                  </div>
                  <input
                    type="date"
                    className="form-control"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    style={{
                      height: '50px',
                      fontSize: '16px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      backgroundColor: '#f8f9fa'
                    }}
                  />
                </div>

                {/* Gender Field */}
                <div className="mb-4">
                  <div className="form-label mb-3" style={{fontSize: '16px', color: '#666', fontWeight: '500'}}>
                    Gender
                  </div>
                  <div className="d-flex gap-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="gender"
                        id="male"
                        value="male"
                        checked={gender === 'male'}
                        onChange={(e) => setGender(e.target.value)}
                        style={{
                          width: '20px',
                          height: '20px',
                          marginTop: '2px'
                        }}
                      />
                      <div 
                        className="form-check-label ms-2" 
                        htmlFor="male"
                        style={{fontSize: '16px', color: '#666', cursor: 'pointer'}}
                      >
                        Male
                      </div>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="gender"
                        id="female"
                        value="female"
                        checked={gender === 'female'}
                        onChange={(e) => setGender(e.target.value)}
                        style={{
                          width: '20px',
                          height: '20px',
                          marginTop: '2px'
                        }}
                      />
                      <div 
                        className="form-check-label ms-2" 
                        htmlFor="female"
                        style={{fontSize: '16px', color: '#666', cursor: 'pointer'}}
                      >
                        Female
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signup Button */}
                <button
                  type="button"
                  className="btn w-100 mb-3"
                  onClick={handleSignup}
                  style={{
                    height: '50px',
                    fontSize: '18px',
                    fontWeight: '600',
                    backgroundColor: '#007bff',
                    border: 'none',
                    borderRadius: '25px',
                    color: '#fff'
                  }}
                >
                  signup
                </button>

                {/* Or Divider */}
                <div className="text-center mb-3">
                  <span style={{fontSize: '16px', color: '#666', fontWeight: '600'}}>Or</span>
                </div>

                {/* Google Signup Button */}
                <button
                  type="button"
                  className="btn w-100 d-flex align-items-center justify-content-center mb-4"
                  onClick={handleGoogleSignup}
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

                {/* Login Link */}
                <div className="text-center">
                  <span style={{fontSize: '16px', color: '#666'}}>
                    Already have an account?{' '}
                    <button 
                      className="btn p-0"
                      onClick={handleLogin}
                      style={{
                        color: '#007bff',
                        textDecoration: 'none',
                        fontWeight: '600',
                        border: 'none',
                        background: 'none',
                        fontSize: '16px'
                      }}
                    >
                      Login
                    </button>
                  </span>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bootstrap CSS */}
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css"
        rel="stylesheet"
      />
    </div>
  );
};

export default Signup;