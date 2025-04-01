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
    work_hours: "",
  });

  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  const [startHour, setStartHour] = useState("9");
  const [startMinute, setStartMinute] = useState("00");
  const [startPeriod, setStartPeriod] = useState("AM");

  const [endHour, setEndHour] = useState("5");
  const [endMinute, setEndMinute] = useState("00");
  const [endPeriod, setEndPeriod] = useState("PM");

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

      const [start, end] = (data.work_hours || "9:00 AM - 5:00 PM").split(" - ");
      const [startHr, startMin, startAmPm] = parseTimeParts(start);
      const [endHr, endMin, endAmPm] = parseTimeParts(end);

      setProfile({
        ...data,
        email: session.user.email,
      });

      setTimezone(data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
      setStartHour(startHr);
      setStartMinute(startMin);
      setStartPeriod(startAmPm);
      setEndHour(endHr);
      setEndMinute(endMin);
      setEndPeriod(endAmPm);
      setLoading(false);
    };

    fetchProfile();
  }, [session, navigate]);

  const parseTimeParts = (time) => {
    const [timePart, period] = time.trim().split(" ");
    const [hr, min] = timePart.split(":");
    return [hr, min, period];
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const assembledWorkHours = `${startHour}:${startMinute} ${startPeriod} - ${endHour}:${endMinute} ${endPeriod}`;

    const updatePayload = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      timezone: timezone,
      work_hours: assembledWorkHours,
    };

    console.log("Update payload:", updatePayload);

    const { error } = await supabase
      .from("Profiles")
      .update(updatePayload)
      .eq("id", session.user.id); // Change to "user_id" if needed

    if (error) {
      alert("Error saving profile.");
      console.error("Supabase update error:", error.message || error);
    } else {
      alert("Profile updated!");
    }

    if (newPassword) {
      const { error: pwError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (pwError) {
        alert("Password update failed: " + pwError.message);
        console.error("Password update error:", pwError.message || pwError);
      } else {
        alert("Password updated!");
        setNewPassword("");
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (errorMessage) return <p>{errorMessage}</p>;

  const hourOptions = [...Array(12).keys()].map((n) => String(n + 1));
  const minuteOptions = ["00", "15", "30", "45"];

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
        onChange={handleChange}
      />

      <label>Last Name:</label>
      <input
        type="text"
        name="last_name"
        value={profile.last_name}
        onChange={handleChange}
      />

      <label>Email:</label>
      <input type="text" value={profile.email} disabled readOnly />

      <label>Timezone:</label>
      <TimezoneSelect
        value={{ value: timezone, label: timezone }}
        onChange={(selected) => setTimezone(selected.value)}
      />

      <label>Work Hours:</label>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <p>Start Time</p>
          <select value={startHour} onChange={(e) => setStartHour(e.target.value)}>
            {hourOptions.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          :
          <select value={startMinute} onChange={(e) => setStartMinute(e.target.value)}>
            {minuteOptions.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select value={startPeriod} onChange={(e) => setStartPeriod(e.target.value)}>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
        <div>
          <p>End Time</p>
          <select value={endHour} onChange={(e) => setEndHour(e.target.value)}>
            {hourOptions.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          :
          <select value={endMinute} onChange={(e) => setEndMinute(e.target.value)}>
            {minuteOptions.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select value={endPeriod} onChange={(e) => setEndPeriod(e.target.value)}>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
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
