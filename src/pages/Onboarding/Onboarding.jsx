import React, { useState, useEffect, useContext } from 'react';
import TimezoneSelect from 'react-timezone-select';
import { supabase, AuthContext } from "../../AuthProvider";
import { useNavigate } from "react-router-dom";
import './Onboarding.css';

export default function Onboarding() {
  const [organization, setOrganization] = useState('');
  const [timezone, setTimezone] = useState('');
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

    const { data, error } = await supabase
      .from("Profiles")
      .upsert({
        id: session.user.id,
        organization,
        timezone
      })
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
        <h1 className="onboarding-title">TimeSync</h1>
        <span className="onboarding-subtitle">Connection Across the Globe</span>
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
            onChange={setTimezone}
            className="form-input"
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Finish Setup
        </button>
      </form>
    </div>
  );
}
