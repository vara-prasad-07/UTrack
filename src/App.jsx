
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx';
import Ask from './pages/Ask.jsx';
import Scan from './pages/Scan.jsx';
import ScanResult from './pages/ScanResult.jsx';
import Alerts from './pages/Alerts.jsx';
import You from './pages/You.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';

function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Home />} />
      <Route path="/chat" element={<Ask />} />
      <Route path="/scan" element={<Scan />} />
      <Route path="/scan-result" element={<ScanResult />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/profile" element={<You />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  )
}

export default App
