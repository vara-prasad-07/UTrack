
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx';
import Ask from './pages/Ask.jsx';
import Scan from './pages/Scan.jsx';
import ScanResult from './pages/ScanResult.jsx';
import Alerts from './pages/Alerts.jsx';
import You from './pages/You.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import SignUp from './pages/SignUp.jsx';
import SetUp from './pages/SetUp.jsx';
import PaymentDemoPage from './pages/PaymentDemoPage.jsx';
import PaymentSuccess from './pages/PaymentSuccess.jsx';
import MainLayout from './components/MainLayout.jsx';

function App() {
  return (
    <Routes>
       <Route element={<MainLayout />}>
         <Route path="/dashboard" element={<Home />} />
         <Route path="/chat" element={<Ask />} />
      <Route path="/scan" element={<Scan />} />
      <Route path="/scan-result" element={<ScanResult />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/profile" element={<You />} />
       </Route>
     
      
      
      
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/setup" element={<SetUp />} />
      <Route path="/payment-demo" element={<PaymentDemoPage />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
    </Routes>
  )
}

export default App
