import React, { useState, useEffect, useContext } from 'react';
import TimezoneSelect from 'react-timezone-select';
import { supabase, AuthContext } from "../../AuthProvider";
import { useNavigate } from "react-router-dom";
import './Onboarding.css';
import logo from "../../assets/logo.png";
import { GoDash } from "react-icons/go";

export default function Onboarding() {
  const [organization, setOrganization] = useState('');
  const [timezone, setTimezone] = useState({});
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [workRange, setWorkRange] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { session } = useContext(AuthContext);
  
  // Fetch user session and profile data
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching user session:', error.message);
        return;
      }
      setUser(data?.user);
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) {
      alert("User is not signed in");
      navigate("/login");
      return;
    }

    const timezoneLabel = timezone?.label || timezone;
    console.log("Timezone label:", timezone);
    
    const workHours = [startTime, endTime];

    const { data, error } = await supabase
      .from("Profiles")
      .update({
        id: session.user.id,
        organization: organization,
        timezone: timezoneLabel, 
        work_range: workHours,
      })
      .eq("id", session.user.id)
      .select();
    if (error) {
      alert("Error updating profile: " + error.message);
      return;
    }
    
    alert("Information added successfully!");
    navigate("/home");
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <img src={logo} alt="Logo" className="logo" />
        <h1>TimeSync</h1>
        <h4>Connection Across the Globe</h4>
      </div>
      <form className="onboarding-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="organization" className="form-label">Organization</label>
          <input
            type="text"
            id="organization"
            name="organization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="University, Work, etc..."
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="timezone" className="form-label">Timezone</label>
          <TimezoneSelect
            id="timezone"
            name="timezone"
            value={timezone}
            onChange={(selectedOption) => setTimezone(selectedOption)}
            className="form-input"
            required
          />
        </div>
        <div className="form-group-time">
        <label htmlFor="work-hours" className="form-label">Work Hours</label>
          <div className="work-hours-container">
            <input
              type="time"
              step="360"
              id="start-time"
              name="start-time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="form-input-time"
            />
            <div className="dash-icon"> - </div>
            <input
              type="time"
              step="360"
              id="end-time"
              name="end-time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="form-input-time"
            />
          </div>
        </div>
        <button type="submit" className="submit-button">
          Finish Setup
        </button>
      </form>
    </div>
  );
}
