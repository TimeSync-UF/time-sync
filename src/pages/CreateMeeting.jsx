import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome } from "react-icons/fa";
import './CreateMeeting.css';

export default function CreateMeeting() {
  const [title, setTitle] = useState('');
  const [datetime, setDatetime] = useState('');
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [meetings, setMeetings] = useState([]);

  const navigate = useNavigate();

  // Simulated contacts list (replace with Supabase later)
  useEffect(() => {
    setContacts([
      { name: 'Dimitri Dimitrakis', email: 'ddimitrakis@ufl.edu' },
      { name: 'Jane Smith', email: 'jane@example.com' }
    ]);
  }, []);

  const handleAddContact = (email) => {
    if (!selectedContacts.includes(email)) {
      setSelectedContacts([...selectedContacts, email]);
    }
  };

  const handleRemoveContact = (email) => {
    setSelectedContacts(selectedContacts.filter(c => c !== email));
  };

  const handleSubmit = () => {
    if (!title || !datetime || selectedContacts.length === 0) {
      alert('Please fill in all fields and add at least one contact.');
      return;
    }

    const newMeeting = {
      title,
      datetime,
      contacts: selectedContacts,
    };

    setMeetings([...meetings, newMeeting]);

    // Clear form
    setTitle('');
    setDatetime('');
    setSelectedContacts([]);
  };

  return (
    <div className="create-meeting-container">
      {/* Home Button */}
      <div className="home-button" onClick={() => navigate("/home")}>
        <FaHome />
      </div>

      <h1>Create Meeting</h1>

      <input
        type="text"
        placeholder="Meeting Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="datetime-local"
        value={datetime}
        onChange={(e) => setDatetime(e.target.value)}
      />

      <div className="contact-select">
        <h3>Select Contacts:</h3>
        {contacts.map((contact) => (
          <div key={contact.email} className="contact-entry">
            <span>{contact.name} ({contact.email})</span>
            <button onClick={() => handleAddContact(contact.email)}>Add</button>
          </div>
        ))}
      </div>

      {selectedContacts.length > 0 && (
        <div className="selected-contacts">
          <h4>Added Contacts:</h4>
          <ul>
            {selectedContacts.map((email) => (
              <li key={email}>
                {email}
                <button onClick={() => handleRemoveContact(email)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button className="save-button" onClick={handleSubmit}>Create Meeting</button>

      {/* Scheduled Meetings Section */}
      {meetings.length > 0 && (
        <div className="meetings-section">
          <h2>Scheduled Meetings</h2>
          <ul className="meeting-list">
            {meetings.map((meeting, index) => (
              <li key={index} className="meeting-card">
                <h3>{meeting.title}</h3>
                <p>
                    <strong>Date/Time:</strong>{" "}
                    {new Date(meeting.datetime).toLocaleString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    })}
                </p>
                <p><strong>Participants:</strong> {meeting.contacts.join(', ')}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
