import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import HomeCalendar from "./pages/Calendar.jsx";
import CreateMeeting from "./pages/CreateMeeting.jsx";
import PreviousMeetings from "./pages/PreviousMeetings.jsx";
import UpcomingMeetings from "./pages/UpcomingMeetings.jsx";
import FAQ from "./pages/FAQ.jsx";
import MeetingHeatmap from './pages/MeetingHeatmap.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeCalendar /> }/>
        <Route path="/create-meeting" element={<CreateMeeting /> }/>
        <Route path="/previous-meetings" element={<PreviousMeetings /> }/>
        <Route path="/upcoming-meetings" element={<UpcomingMeetings /> }/>
        <Route path="/FAQ" element={<FAQ /> }/>
        <Route path="/meeting-heatmap" element={<MeetingHeatmap /> }/>
        <Route path="/login" element={<Login /> }/>
        <Route path="/signup" element={<Signup /> }/>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
