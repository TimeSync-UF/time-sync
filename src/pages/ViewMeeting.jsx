import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase, AuthContext } from "../AuthProvider.jsx";
import { FaHome, FaEdit, FaUserFriends } from "react-icons/fa";
import { format } from "date-fns";
import "./ViewMeeting.css";

// Mock meeting data for testing
const mockMeetings = { // TODO: Remove this when not needed
  "mock-meeting-1": {
    id: "mock-meeting-1",
    title: "Project Review",
    start_time: new Date(new Date().setHours(14, 0, 0)).toISOString(),
    end_time: new Date(new Date().setHours(15, 30, 0)).toISOString(),
    location: "Zoom",
    description: "Review project progress and discuss next steps with the development team.",
    duration: 90,
    displayTimezone: "New York (ET)",
    participants: []
  },
  "mock-meeting-2": {
    id: "mock-meeting-2",
    title: "Client Meeting",
    start_time: new Date(new Date().setHours(10, 0, 0)).toISOString(),
    end_time: new Date(new Date().setHours(11, 0, 0)).toISOString(),
    location: "Microsoft Teams",
    description: "Meeting with client to discuss requirements for the new feature set.",
    duration: 60,
    displayTimezone: "Los Angeles (PT)",
    participants: []
  }
};

const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return null;
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  const diffMs = end - start;
  const diffMinutes = Math.round(diffMs / 60000);
  
  return diffMinutes;
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
    // If this is a mock meeting ID, use mock data
    if (meetingId.startsWith('mock-meeting')) {
      setMeeting(mockMeetings[meetingId]);
      setLoading(false);
      return;
    }
    
    // Else, proceed with real data
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
          <p><strong>Duration:</strong> {meeting.duration || "Not specified"} minutes</p>
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
                    <p>Timezone: {participant.timezone}</p>
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