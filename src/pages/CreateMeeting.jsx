import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaHome } from "react-icons/fa";
import './CreateMeeting.css';
import { supabase, AuthContext } from "../AuthProvider.jsx";

export default function CreateMeeting() {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { session } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!session?.user?.id) return;
    const userId = session.user.id;

    const fetchContacts = async () => {
      const { data: profileData, error: profileError } = await supabase
        .from("Profiles")
        .select("contacts")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError.message);
        return;
      }

      if (!profileData?.contacts || profileData.contacts.length === 0) {
        setContacts([]);
        return;
      }

      const { data: contactsData, error: contactsError } = await supabase
        .from("Profiles")
        .select("id, first_name, last_name, email, timezone")
        .in("id", profileData.contacts);

      if (contactsError) {
        console.error("Error fetching contacts:", contactsError.message);
        return;
      }

      setContacts(contactsData);
    };

    fetchContacts();
  }, [session]);

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

    if (!title) {
      alert("Please fill in all fields.");
      return;
    }
    
    const startTimeDate = new Date(startTime).toISOString();
    // end date = startTimeDate + 1 hour
    const endTimeDate = new Date(new Date(startTimeDate).getTime() + 60 * 60 * 1000).toISOString();

    const meetingData = {
      title,
      start_time: startTimeDate,
      end_time: endTimeDate,
      location,
      description,
      participants: selectedContacts.map(c => c.id),
    };

    const { data, error } = await supabase
      .from("Meetings")
      .insert([meetingData])
      .select("id")
      .single();

    if (error) {
      console.error("Error creating meeting:", error.message);
      return;
    }

    setMeetings([...meetings, meetingData]);
    setTitle('');
    setStartTime('');
    setEndTime('');
    setSelectedContacts([]);

    const meetingId = data.id;
    console.log("New Meeting ID:", meetingId);

    navigate(`/${meetingId}/heatmap`);
  };

  return (
    <div className="create-meeting-container">
      <div className="home-button" onClick={() => navigate("/home")}>
        <FaHome />
      </div>

      <h1>Create Meeting</h1>

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
        <label htmlFor="start-time">Date:</label>
        <input
          id="start-time"
          type="date"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </div>

      {/* End Time Input
      <div className="input-group">
        <label htmlFor="end-time">End Time:</label>
        <input
          id="end-time"
          type="date"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div> */}

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
                    <h4>Email: {contact.email}</h4>
                    <h4 style={!contact.timezone ? {color: "#e74c3c"} : {}}>
                      Timezone: {contact.timezone || "Not set"}
                    </h4>
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
                  <div>
                    <h3>{`${contact.first_name} ${contact.last_name}`}</h3>
                    <h4>Email: {contact.email}</h4>
                    <h4 style={!contact.timezone ? {color: "#e74c3c"} : {}}>
                      Timezone: {contact.timezone || "Not set"}
                    </h4>
                  </div>
                  <button className="remove-button" onClick={() => handleRemoveContact(contact.id)}>Remove</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No contacts added yet.</p>
          )}
        </div>
      </div>


      <button className="save-button" onClick={handleSubmit}>Generate Heatmap</button>

      {meetings.length > 0 && (
        <div className="meetings-section">
          <h2>Scheduled Meetings</h2>
          <ul className="meeting-list">
            {meetings.map((meeting, index) => (
              <li key={index} className="meeting-card">
                <h3>{meeting.title}</h3>
                <h4>
                  <strong>Start:</strong>{" "}
                  {new Date(meeting.start_time).toLocaleString([], {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </h4>
                <h4>
                  <strong>End:</strong>{" "}
                  {new Date(meeting.end_time).toLocaleString([], {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </h4>
                <h4>
                  <strong>Participants: </strong> 
                  {meeting.participants.map(participantId => {
                    const participant = contacts.find(c => c.id === participantId);
                    return participant ? `${participant.first_name} ${participant.last_name}` : 'Unknown';
                  }).join(', ')}
                </h4>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
