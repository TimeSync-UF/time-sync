import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaHome, FaTrash, FaEdit} from "react-icons/fa";
import './CreateMeeting.css'; // Uses the same CSS as CreateMeeting.jsx
import { supabase, AuthContext } from "../AuthProvider.jsx";
import { id } from 'date-fns/locale';

export default function EditMeeting() {
  const { meetingId } = useParams();
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { session } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!session?.user?.id) return;
    const userId = session.user.id;

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
        
        // Check if current user is the host/owner of the meeting
        if (meetingData.host === userId) {
          setIsOwner(true);
        }
        
        setTitle(meetingData.title || '');
        setLocation(meetingData.location || '');
        setDescription(meetingData.description || '');
        
        if (meetingData.start_time) {
          const startDate = new Date(meetingData.start_time);
          setStartTime(formatDateForInput(startDate));
        }
        
        if (meetingData.end_time) {
          const endDate = new Date(meetingData.end_time);
          setEndTime(formatDateForInput(endDate));
        }

        // Fetch participant details
        let selectedContactIds = [];
        if (meetingData.participants && meetingData.participants.length > 0) {
          const { data: participantsData } = await supabase
            .from("Profiles")
            .select("id, first_name, last_name, email, timezone")
            .in("id", meetingData.participants);
          
          if (participantsData) {
            selectedContactIds = participantsData.map(c => c.id);
            setSelectedContacts(participantsData);
          }
        }

        // Fetch contacts
        const { data: profileData, error: profileError } = await supabase
          .from("Profiles")
          .select("contacts")
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;

        if (profileData?.contacts && profileData.contacts.length > 0) {
          const { data: contactsData, error: contactsError } = await supabase
            .from("Profiles")
            .select("id, first_name, last_name, email, timezone")
            .in("id", profileData.contacts);

          if (contactsError) throw contactsError;
          
          // Filter out selected contacts
          const availableContacts = contactsData.filter(c => !selectedContactIds.includes(c.id));
          setContacts(availableContacts);
        }
      } catch (err) {
        console.error("Error fetching meeting details:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingDetails();
  }, [meetingId, session]);

  const formatDateForInput = (date) => {
    return date.toISOString().slice(0, 16);
  };

  const handleAddContact = (contactId) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
  
    // Add to selected contacts
    setSelectedContacts([...selectedContacts, contact]);
  
    // Remove from available contacts
    setContacts(contacts.filter(c => c.id !== contactId));
  };
  
  const handleRemoveContact = (contactId) => {
    const contact = selectedContacts.find(c => c.id === contactId);
    if (!contact) return;
  
    // Remove from selected contacts
    setSelectedContacts(selectedContacts.filter(c => c.id !== contactId));
  
    // Add back to available contacts
    setContacts([...contacts, contact]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !startTime || !endTime) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!isOwner) {
      alert("You don't have permission to edit this meeting.");
      return;
    }

    const {data, error} = await supabase
      .from("Meetings")
      .upsert({
        id: meetingId, // Ensure we are updating the correct meeting
        title,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        location,
        description,
        participants: selectedContacts.map(c => c.id) // Save selected contacts
      })
      .select();

      console.log("Meeting id:", meetingId);
      console.log("Update response:", data, error);

      if(error) {
        console.error("Error updating meeting:", error.message);
        alert("Error updating meeting: " + error.message);
        return;
      }
    alert("Meeting Successfully Updated!");
    navigate("/meeting/:meetingId"); // Redirect to home after successful update
  };

  const handleDelete = async () => {
    if (!isOwner) {
      alert("You don't have permission to delete this meeting.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this meeting?")) {
      
      // TODO: Implement the delete functionality
      const {data, error} = await supabase
        .from("Meetings")
        .delete()
        .eq("id", meetingId);
      
        if(error) {
          console.error("Error deleting meeting:", error.message);
          alert("Error deleting meeting: " + error.message);
          return;
        }
      alert("Meeting Successfully Deleted!");
      navigate("/home"); // Redirect to home after successful deletion
      // alert("Delete functionality not yet implemented");
    }
  };

  if (loading) return <div className="loading">Loading meeting details...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="create-meeting-container">
      <div className="home-button" onClick={() => navigate("/home")}>
        <FaHome />
      </div>

      <h1>Edit Meeting</h1>

      {/* Meeting Title Input */} 
      <div className="input-group">
        <label htmlFor="meeting-title">Meeting Title:</label>
        <input
          id="meeting-title"
          type="text"
          placeholder="Enter meeting title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Start Time Input */}
      <div className="input-group">
        <label htmlFor="start-time">Start Time:</label>
        <input
          id="start-time"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </div>

      {/* End Time Input */}
      <div className="input-group">
        <label htmlFor="end-time">End Time:</label>
        <input
          id="end-time"
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
      </div>

      {/* Location Input */}
      <div className="input-group">
        <label htmlFor="location">Location:</label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      {/* Description Input */}
      <div className="input-group">
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
      </div>

      <div className="create-meeting-contacts-container">
        {/* Available Contacts */}
        <div className="contacts-box">
          <h3>Available Contacts</h3>
          <div className="input-group">
            <label htmlFor="search-contacts">Search Contacts:</label>
            <input
              id="search-contacts"
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ul className="contacts-list">
            {contacts
              .filter(contact =>
                `${contact.first_name} ${contact.last_name}`
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              )
              .map((contact) => (
                <li key={contact.id} className="contact-card">
                  <div>
                    <h3>{`${contact.first_name} ${contact.last_name}`}</h3>
                    <h4>Timezone: {contact.timezone}</h4>
                  </div>
                  <button className="add-button" onClick={() => handleAddContact(contact.id)}>
                    Add
                  </button>
                </li>
              ))}
          </ul>
        </div>

        {/* Selected Contacts */}
        <div className="selected-contacts-box">
          <h3>Added Contacts</h3>
          {selectedContacts.length > 0 ? (
            <ul className="selected-contacts-list">
              {selectedContacts.map((contact) => (
                <li key={contact.id} className="selected-contact-card">
                  <h3>{`${contact.first_name} ${contact.last_name}`}</h3>
                  <button className="remove-button" onClick={() => handleRemoveContact(contact.id)}>Remove</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No contacts added yet.</p>
          )}
        </div>
      </div>

      <div className="meeting-actions">
        <button className="save-button" onClick={handleSubmit} disabled={!isOwner}>
          <FaEdit /> Update Meeting
        </button>
        <button className="delete-button" onClick={handleDelete} disabled={!isOwner}>
          <FaTrash /> Delete Meeting
        </button>
      </div>
    </div>
  );
} 