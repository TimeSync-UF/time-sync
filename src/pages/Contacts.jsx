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
  const [contactsSearchTerm, setContactsSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const { session } = useContext(AuthContext);
  const [addedContacts, setAddedContacts] = useState({});

  useEffect(() => {
    if (!session?.user?.id) return;
    refreshContacts();
  }, [session]);

  const refreshContacts = async () => {
    if (!session?.user?.id) return;
    const userId = session.user.id;

    try {
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
    } catch (error) {
      console.error("Error refreshing contacts:", error.message);
    }
  };

  const openModal = async () => {
    setShowModal(true);
    setAddedContacts({});

    try {
      const { data, error } = await supabase
        .from("Profiles")
        .select("id, first_name, last_name, email, timezone");

      if (error) {
        console.error("Error fetching users:", error.message);
        return;
      }

      // Exclude current user and already added contacts
      const currentContactIds = contacts.map(contact => contact.id);
      const filteredUsers = data.filter(user => 
        user.id !== session.user.id && !currentContactIds.includes(user.id)
      );

      setAllUsers(filteredUsers);
    } catch (error) {
      console.error("Error in openModal:", error.message);
    }
  };

  const handleAddContact = async (contactId) => {
    setAddedContacts(prev => ({
      ...prev,
      [contactId]: true
    }));
    
    try {
      // First, check if the contact is already in the user's contacts
      const { data: profileData, error: profileError } = await supabase
        .from("Profiles")
        .select("contacts")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError.message);
        return;
      }

      // If contacts is null or undefined, initialize it as an empty array
      const currentContacts = profileData.contacts || [];
      
      // Check if contact is already added
      if (currentContacts.includes(contactId)) {
        console.log("Contact already exists in your contacts");
        return;
      }

      // Add the new contact to the array
      const updatedContacts = [...currentContacts, contactId];

      // Update the contacts array in the database
      const { error: updateError } = await supabase
        .from("Profiles")
        .update({ contacts: updatedContacts })
        .eq("id", session.user.id);

      if (updateError) {
        console.error("Error adding contact:", updateError.message);
        return;
      }

      // Fetch the complete contact information including timezone
      const { data: contactData, error: contactError } = await supabase
        .from("Profiles")
        .select("id, first_name, last_name, email, timezone")
        .eq("id", contactId)
        .single();

      if (contactError) {
        console.error("Error fetching contact details:", contactError.message);
        // Still add the contact with available info
        const newContact = allUsers.find(user => user.id === contactId);
        if (newContact) {
          setContacts([...contacts, newContact]);
          setAllUsers(allUsers.filter(user => user.id !== contactId));
        }
        return;
      }

      // Add the contact with complete information
      setContacts([...contacts, contactData]);
      
      // Remove the added contact from allUsers
      setAllUsers(allUsers.filter(user => user.id !== contactId));
    } catch (error) {
      console.error("Error in handleAddContact:", error.message);
    }
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm("Are you sure you want to remove this contact?")) {
      return;
    }

    try {
      // Get the current contacts array
      const { data: profileData, error: profileError } = await supabase
        .from("Profiles")
        .select("contacts")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError.message);
        return;
      }

      const updatedContacts = profileData.contacts.filter(id => id !== contactId);

      const { error: updateError } = await supabase
        .from("Profiles")
        .update({ contacts: updatedContacts })
        .eq("id", session.user.id);

      if (updateError) {
        console.error("Error removing contact:", updateError.message);
        return;
      }

      setContacts(contacts.filter(contact => contact.id !== contactId));
    } catch (error) {
      console.error("Error in handleDelete:", error.message);
    }
  };

  const filteredUsers = allUsers.filter(user =>
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContacts = contacts.filter(contact =>
    `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(contactsSearchTerm.toLowerCase())
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

      {/* Search bar for contacts */}
      <div className="contacts-search-container">
        <h2>Search Contacts:</h2>
        <input
          type="text"
          placeholder="Search by name..."
          value={contactsSearchTerm}
          onChange={(e) => setContactsSearchTerm(e.target.value)}
          className="contacts-search-input"
        />
      </div>

      {contacts.length === 0 ? (
        <p>You have no contacts.</p>
      ) : filteredContacts.length === 0 ? (
        <p>No contacts match your search.</p>
      ) : (
        <ul className="contacts-list">
          {filteredContacts.map((contact) => (
            <li key={contact.id} className="contact-card">
              <div>
                <h3>{`${contact.first_name} ${contact.last_name}`}</h3>
                <h4>Email: {contact.email}</h4>
                <h4 style={!contact.timezone ? {color: "#e74c3c"} : {}}>
                  Timezone: {contact.timezone || "Not set"}
                </h4>
              </div>
              <button className="contacts-delete-button" onClick={() => handleDelete(contact.id)}>
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
                      <button 
                        className={addedContacts[user.id] ? 'added' : ''} 
                        onClick={() => handleAddContact(user.id)}
                        disabled={addedContacts[user.id]}
                      >
                        {addedContacts[user.id] ? 'Added' : 'Add'}
                      </button>
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
