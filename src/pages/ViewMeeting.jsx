import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase, AuthContext } from "../AuthProvider.jsx";
import { FaHome, FaEdit, FaUserFriends } from "react-icons/fa";
import { format } from "date-fns";
import "./ViewMeeting.css";

const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return null;
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  const diffMs = end - start;
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  let durationParts = [];
  if (days > 0) {
    durationParts.push(`${days} day${days !== 1 ? 's' : ''}`);
  }
  if (hours > 0) {
    durationParts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  }
  if (minutes > 0 || (days === 0 && hours === 0)) {
    durationParts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  }
  
  if (durationParts.length === 1) {
    return durationParts[0];
  } else if (durationParts.length === 2) {
    return `${durationParts[0]} and ${durationParts[1]}`;
  } else {
    const lastPart = durationParts.pop();
    return `${durationParts.join(', ')}, and ${lastPart}`;
  }
};

export default function ViewMeeting() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { session } = useContext(AuthContext);
  const [meeting, setMeeting] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    
    const fetchMeetingDetails = async () => {
      setLoading(true);
      try {
        // Fetch meeting details
        const { data: meetingData, error: meetingError } = await supabase
          .from("Meetings")
          .select("*")
          .eq("id", meetingId)
          .single();

        if (meetingError) throw meetingError;
        setMeeting(meetingData);

        // Fetch participant details if there are participants
        if (meetingData.participants && meetingData.participants.length > 0) {
          const { data: participantsData, error: participantsError } = await supabase
            .from("Profiles")
            .select("id, first_name, last_name, email, timezone")
            .in("id", meetingData.participants);

          if (participantsError) throw participantsError;
          setParticipants(participantsData);
        }

        // Calculate duration
        const duration = calculateDuration(meetingData.start_time, meetingData.end_time);
        
        // Add duration to meeting data
        setMeeting({
          ...meetingData,
          duration: duration
        });
      } catch (err) {
        console.error("Error fetching meeting details:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingDetails();
  }, [meetingId, session]);

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);
    return format(date, "MMMM d, yyyy 'at' h:mm a");
  };

  if (loading) return <div className="loading">Loading meeting details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!meeting) return <div className="not-found">Meeting not found</div>;

  return (
    <div className="view-meeting-container">
      <div className="navigation-buttons">
        <button className="home-button" onClick={() => navigate("/home")}>
          <FaHome />
          Home
        </button>
      </div>

      <div className="meeting-header">
        <h1>{meeting.title || "Untitled Meeting"}</h1>
        <div className="meeting-actions">
          <button className="edit-button" onClick={() => navigate(`/edit-meeting/${meetingId}`)}>
            <FaEdit /> Edit Meeting
          </button>
        </div>
      </div>

      <div className="meeting-details">
        <div className="detail-section">
          <h2>Time & Date</h2>
          <p><strong>Start:</strong> {formatDateTime(meeting.start_time)} {meeting.displayTimezone && `(${meeting.displayTimezone})`}</p>
          <p><strong>End:</strong> {formatDateTime(meeting.end_time)} {meeting.displayTimezone && `(${meeting.displayTimezone})`}</p>
          <p><strong>Duration:</strong> {meeting.duration || "Not specified"}</p>
        </div>

        <div className="detail-section">
          <h2>Meeting Information</h2>
          <p><strong>Location:</strong> {meeting.location || "Not specified"}</p>
          <p><strong>Description:</strong> {meeting.description || "No description provided"}</p>
        </div>

        <div className="detail-section">
          <h2>Participants <FaUserFriends /></h2>
          {participants.length > 0 ? (
            <ul className="participants-list">
              {participants.map((participant) => (
                <li key={participant.id} className="participant-item">
                  <div className="participant-info">
                    <h3>{participant.first_name} {participant.last_name}</h3>
                    <p>{participant.email}</p>
                    <p style={!participant.timezone ? {color: "#e74c3c"} : {}}>
                      Timezone: {participant.timezone || "Not set"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No participants</p>
          )}
        </div>
      </div>
    </div>
  );
} 