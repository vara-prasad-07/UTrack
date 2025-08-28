import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomSpinner from '../components/CustomSpinner';
import GoogleLoginButton from '../components/GoogleLoginButton'
import {auth,db} from '../firebase'
import {createUserWithEmailAndPassword} from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore";
const Signup = () =>{
  const navigate=useNavigate();
  const [name,setName]=useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  

  const handleSignup = async() => {
    if(email==='' || password==='' || confirmPassword==='' || dateOfBirth==='' || gender==='' || name===''){
      alert("Enter vaild details");
      return;
    }
    else if(password!=confirmPassword){
      alert("make sure password and confirmPassword are same");
      return;
    }
    else{
      try{
        setLoading(true);
         const userCredentials=await createUserWithEmailAndPassword(auth,email,password);
         setLoading(false);
         const user=userCredentials.user;
         const uid=user.uid;
         const user_details={"userdetails":{"name":name,"email":email,"dob":dateOfBirth,"gender":gender}}
         await setDoc(doc(db, "users", uid), user_details);
         console.log("db update with userdetails");
         
         localStorage.setItem("user",JSON.stringify(user));
         navigate('/setup');

         
      }
      catch(error){
        setLoading(false);
        console.error("Signup error:", error.message);
        alert("Signup failed: " + error.message);
      }
    }
    
    
  };

  const handleGoogleSignup = () => {
    console.log('Google signup clicked');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    
    <div className="min-h-screen flex items-center justify-center bg-black">
        
      <div className="w-full px-3">
        <div className="flex justify-center">
        <div className="flex items-center justify-start p-6 pt-12">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-black rounded-full"></div>
          </div>
          <span className="text-xl text-white font-semibold">UTrack</span>
        </div>
      </div>
      {loading && <CustomSpinner />}
          <div className="w-full max-w-[400px]">
            
    
            {/* Signup Card */}
            <div className="bg-white shadow-lg rounded-[20px]">
              <div className="p-4">
                
                {/* Signup Title */}
                <h3 className="text-center mb-4 text-[32px] font-semibold text-[#333]">
                  Signup
                </h3>
                <div className="mb-3">
                  <div className="mb-2 text-[16px] text-[#666] font-medium">
                    Full Name
                  </div>
                  <input
                    type="name"
                    className="w-full h-[50px] text-[16px] border border-[#ddd] rounded-lg bg-[#f8f9fa] px-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter your Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
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

                {/* Set Password Field */}
                <div className="mb-3">
                  <div className="mb-2 text-[16px] text-[#666] font-medium">
                    Set Password
                  </div>
                  <input
                    type="password"
                    className="w-full h-[50px] text-[16px] border border-[#ddd] rounded-lg bg-[#f8f9fa] px-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {/* Confirm Password Field */}
                <div className="mb-3">
                  <div className="mb-2 text-[16px] text-[#666] font-medium">
                    Confirm Password
                  </div>
                  <input
                    type="password"
                    className="w-full h-[50px] text-[16px] border border-[#ddd] rounded-lg bg-[#f8f9fa] px-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Confirm your Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {/* Date of Birth Field */}
                <div className="mb-3">
                  <div className="mb-2 text-[16px] text-[#666] font-medium">
                    Date of Birth
                  </div>
                  <input
                    type="date"
                    className="w-full h-[50px] text-[16px] border border-[#ddd] rounded-lg bg-[#f8f9fa] px-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>

                {/* Gender Field */}
                <div className="mb-4">
                  <div className="mb-3 text-[16px] text-[#666] font-medium">
                    Gender
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center">
                      <input
                        className="w-5 h-5 mt-[2px]"
                        type="radio"
                        name="gender"
                        id="male"
                        value="male"
                        checked={gender === 'male'}
                        onChange={(e) => setGender(e.target.value)}
                      />
                      <div 
                        className="ml-2 text-[16px] text-[#666] cursor-pointer" 
                        htmlFor="male"
                      >
                        Male
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        className="w-5 h-5 mt-[2px]"
                        type="radio"
                        name="gender"
                        id="female"
                        value="female"
                        checked={gender === 'female'}
                        onChange={(e) => setGender(e.target.value)}
                      />
                      <div 
                        className="ml-2 text-[16px] text-[#666] cursor-pointer" 
                        htmlFor="female"
                      >
                        Female
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signup Button */}
                <button
                  type="button"
                  className="w-full mb-3 h-[50px] text-[18px] font-semibold rounded-full text-white bg-blue-600 hover:bg-blue-700"
                  onClick={handleSignup}
                >
                  signup
                </button>

                {/* Or Divider */}
                <div className="text-center mb-3">
                  <span style={{fontSize: '16px', color: '#666', fontWeight: '600'}}>Or</span>
                </div>

                {/* Google Signup Button */}
                <GoogleLoginButton/>

                {/* Login Link */}
                <div className="text-center">
                  <span className="text-[16px] text-[#666]">
                    Already have an account?{' '}
                    <button 
                      className="p-0 text-blue-600 font-semibold bg-transparent border-0"
                      onClick={handleLogin}
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
      
    </div>
  );
};

export default Signup;