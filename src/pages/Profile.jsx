import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, supabase } from "../AuthProvider.jsx";
import TimezoneSelect from "react-timezone-select";
import { FaHome } from "react-icons/fa";
import "./Profile.css";

export default function Profile() {
  const { session } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    timezone: "",
    work_range: [],
  });

  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!session) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      const userId = session.user.id;

      const { data, error } = await supabase
        .from("Profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !data) {
        console.error("Supabase fetch error:", error?.message || error);
        setErrorMessage("Could not fetch profile. Please try again later.");
        setLoading(false);
        return;
      }

      const workHours = data.work_range || ["09:00", "17:00"];

      setProfile({ ...data, email: session.user.email });
      setTimezone(data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
      setStartTime(workHours[0]);
      setEndTime(workHours[1]);
      setLoading(false);
    };

    fetchProfile();
  }, [session, navigate]);

  const handleSave = async () => {
    const updatePayload = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      timezone,
      work_range: [startTime, endTime],
    };

    const { error } = await supabase
      .from("Profiles")
      .update(updatePayload)
      .eq("id", session.user.id);

    if (error) {
      alert("Error saving profile.");
      console.error("Supabase update error:", error.message || error);
    } else {
      alert("Profile updated!");
    }

    if (newPassword) {
      const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
      if (pwError) {
        alert("Password update failed: " + pwError.message);
      } else {
        alert("Password updated!");
        setNewPassword("");
      }
    }

    navigate("/home"); // Redirect to home after saving profile
  };

  if (loading) return <p>Loading...</p>;
  if (errorMessage) return <p>{errorMessage}</p>;

  // const hourOptions = [...Array(12).keys()].map((n) => String(n + 1));
  // const minuteOptions = ["00", "15", "30", "45"];

  return (
    <div className="profile-container">
      {/* Home button like in Contacts */}
      <div className="home-button" onClick={() => navigate("/home")}>
        <FaHome />
      </div>

      <h1>My Profile</h1>

      <label>First Name:</label>
      <input
        type="text"
        name="first_name"
        value={profile.first_name}
        onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
      />

      <label>Last Name:</label>
      <input
        type="text"
        name="last_name"
        value={profile.last_name}
        onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
      />

      <label>Email:</label>
      <input type="text" value={profile.email} disabled readOnly />

      <label>Timezone:</label>
      <TimezoneSelect
        value={{ value: timezone, label: timezone }}
        onChange={(selected) => setTimezone(selected.value)}
      />

      <label>Work Hours:</label>
      <div className="form-group-time">
        <label htmlFor="work-hours" className="form-label">Work Hours</label>
        <div className="work-hours-container">
          <input type="time" step="360" id="start-time" name="start-time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="form-input-time" />
          <div className="dash-icon"> - </div>
          <input type="time" step="360" id="end-time" name="end-time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="form-input-time" />
        </div>
      </div>

      <label>Change Password:</label>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
        />
        <button
          type="button"
          style={{
            padding: "0.3rem 0.75rem",
            borderRadius: "6px",
            backgroundColor: "#1d2d44",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      <button onClick={handleSave} className="save-button">
        Save Changes
      </button>
    </div>
  );
}
