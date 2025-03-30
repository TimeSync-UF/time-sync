import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import HomeCalendar from "./pages/Calendar.jsx";
import CreateMeeting from "./pages/CreateMeeting.jsx";
import ViewMeeting from "./pages/ViewMeeting.jsx";
import PreviousMeetings from "./pages/PreviousMeetings.jsx";
import ContactsList from "./pages/ContactsList.jsx";
import FAQ from "./pages/FAQ.jsx";
import MeetingHeatmap from './pages/MeetingHeatmap.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import { AuthProvider } from "./AuthProvider.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<HomeCalendar /> }/>
          <Route path="/create-meeting" element={<CreateMeeting /> }/>
          <Route path="/meeting/:meetingId" element={<ViewMeeting />} />
          <Route path="/previous-meetings" element={<PreviousMeetings /> }/>
          <Route path="/contacts-list" element={<ContactsList /> }/>
          <Route path="/FAQ" element={<FAQ /> }/>
          <Route path="/meeting-heatmap" element={<MeetingHeatmap /> }/>
          <Route path="/login" element={<Login /> }/>
          <Route path="/signup" element={<Signup /> }/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
