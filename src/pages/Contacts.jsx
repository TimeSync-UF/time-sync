import React, { useState, useEffect, useContext } from 'react';
import './Contacts.css';
import { FaHome } from "react-icons/fa";
import { MdDeleteForever } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { supabase, AuthContext } from "../AuthProvider.jsx";

export default function Contacts() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const { session } = useContext(AuthContext);

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

  const openModal = async () => {
    setShowModal(true);

    const { data, error } = await supabase
      .from("Profiles")
      .select("id, first_name, last_name, email");

    if (error) {
      console.error("Error fetching users:", error.message);
      return;
    }

    // Exclude already added contacts
    const currentContactIds = contacts.map(contact => contact.id);
    const filteredUsers = data.filter(user => !currentContactIds.includes(user.id));

    setAllUsers(filteredUsers);
  };

  const handleAddContact = async (contactId) => {
    const { error } = await supabase
      .from("Profiles")
      .update({ contacts: supabase.raw(`array_append(contacts, '${contactId}')`) })
      .eq("id", session.user.id);

    if (error) {
      console.error("Error adding contact:", error.message);
    } else {
      const newContact = allUsers.find(user => user.id === contactId);
      setContacts([...contacts, newContact]);
      setShowModal(false);
    }
  };

  const filteredUsers = allUsers.filter(user =>
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="contacts-container">
      {/* Home button */}
      <div className="home-button" onClick={() => navigate("/home")}>
        <FaHome />
      </div>

      <div className="contacts-header">
        <h1>Contacts</h1>
        <button className="add-button" onClick={openModal}>
          Add Contacts
        </button>
      </div>

      {contacts.length === 0 ? (
        <p>You have no contacts.</p>
      ) : (
        <ul className="contacts-list">
          {contacts.map((contact) => (
            <li key={contact.id} className="contact-card">
              <div>
                <h3>{`${contact.first_name} ${contact.last_name}`}</h3>
                <h4>Email: {contact.email}</h4>
                <h4>Timezone: {contact.timezone}</h4>
              </div>
              <button className="delete-button" onClick={() => handleDelete(contact.id)}>
                <MdDeleteForever />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add Contact Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add Contacts</h2>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <div className="scroll-container">
              <ul className="search-results">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <li key={user.id} className="search-item">
                      <span>{user.first_name} {user.last_name}</span>
                      <button onClick={() => handleAddContact(user.id)}>Add</button>
                    </li>
                  ))
                ) : (
                  <p>No new contacts available</p>
                )}
              </ul>
            </div>
            <button className="close-button" onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
