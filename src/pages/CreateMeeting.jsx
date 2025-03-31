import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome } from "react-icons/fa";
import './CreateMeeting.css';
import { supabase, AuthContext } from "../AuthProvider.jsx";

export default function CreateMeeting() {
  const [title, setTitle] = useState('');
  const [datetime, setDatetime] = useState('');
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const { session } = useContext(AuthContext);
  const navigate = useNavigate();

  // // Simulated contacts list (replace with Supabase later)
  // useEffect(() => {
  //   setContacts([
  //     { name: 'Dimitri Dimitrakis', email: 'ddimitrakis@ufl.edu' },
  //     { name: 'Jane Smith', email: 'jane@example.com' }
  //   ]);
  // }, []);

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

      <ul className="contacts-list">
        {contacts.map((contact) => (
          <li key={contact.id} className="contact-card">
            <div>
              <h3>{`${contact.first_name} ${contact.last_name}`}</h3>
              <h4>Email: {contact.email}</h4>
              <h4>Timezone: {contact.timezone}</h4>
            </div>
            <button className="add-button">Add</button>
          </li>
        ))}
      </ul>

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
