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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeCalendar /> }/>
        <Route path="/create-meeting" element={<CreateMeeting /> }/>
        <Route path="/previous-meetings" element={<PreviousMeetings /> }/>
        <Route path="/upcoming-meetings" element={<UpcomingMeetings /> }/>
        <Route path="/FAQ" element={<FAQ /> }/>

      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
