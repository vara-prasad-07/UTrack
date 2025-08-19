import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleLoginButton from '../components/GoogleLoginButton'
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import CustomSpinner from '../components/CustomSpinner';


const Login = () => {
  const navigate=useNavigate();  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const handleLogin = async () =>{
    if(email==='' || password===''){
      alert("enter valid login details");

      return;
    }
    try{
      setLoading(true);
      const userDetails=await signInWithEmailAndPassword(auth,email,password);
      setLoading(false);
      const user=userDetails.user;
      console.log("successful login:",user);
      navigate('/dashboard');
    }
    catch(error){
      setLoading(false);
      console.error(error.message);
      alert("enter valid details");
    }
  };



  const handleSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full px-3">
        <div className="flex justify-center">
       
          <div className="w-full max-w-[400px]">
          
            {/* Header with Logo */}
            <div className="flex items-center justify-start p-6 pt-12">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-black rounded-full"></div>
          </div>
          <span className="text-xl text-white font-semibold">UTrack</span>
        </div>
      </div>
            {/* Login Card */}
            <div className="bg-white shadow-lg rounded-[20px]">
              <div className="p-4">
                
                {/* Login Title */}
                <h3 className="text-center mb-4 text-[32px] font-semibold text-[#333]">
                  Login
                </h3>
                {loading && <CustomSpinner />}
                {/* Email Field */}
                <div className="mb-3">
                  <div className="mb-2 text-[16px] text-[#666] font-medium">
                    Email Id
                  </div>
                  <input
                    type="email"
                    className="w-full h-[50px] text-[16px] border border-[#ddd] rounded-lg bg-[#f8f9fa] px-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Password Field */}
                <div className="mb-4">
                  <div className="mb-2 text-[16px] text-[#666] font-medium">
                    Password
                  </div>
                  <input
                    type="password"
                    className="w-full h-[50px] text-[16px] border border-[#ddd] rounded-lg bg-[#f8f9fa] px-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter your PassWord"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {/* Login Button */}
                <button
                  type="button"
                  className="w-full mb-3 h-[50px] text-[18px] font-semibold rounded-full text-white bg-blue-600 hover:bg-blue-700"
                  onClick={handleLogin}
                >
                  login
                </button>

                {/* Or Divider */}
                <div className="text-center mb-3">
                  <span style={{fontSize: '16px', color: '#666', fontWeight: '600'}}>Or</span>
                </div>

                {/* Google Login Button */}
                <GoogleLoginButton/>

                {/* Signup Link */}
                <div className="text-center">
                  <span className="text-[16px] text-[#666]">
                    Don't have an account?{' '}
                    <button 
                      className="p-0 text-blue-600 font-semibold bg-transparent border-0"
                      onClick={handleSignup}
                    >
                      Signup
                    </button>
                  </span>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;