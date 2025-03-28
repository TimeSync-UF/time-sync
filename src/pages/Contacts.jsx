import React, { useState, useEffect, useContext } from 'react';
import './Contacts.css';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import { FaHome } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { supabase, AuthContext } from "../AuthProvider.jsx";

export default function Contacts() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const { session } = useContext(AuthContext);

  const handleDelete = async (contactId) => {
    const { error } = await supabase
      .from("Profiles")
      .update({ contacts: supabase.raw(`array_remove(contacts, '${contactId}')`) })
      .eq("id", session.user.id);

    if (error) {
      console.error("Error deleting contact:", error.message);
    } else {
      setContacts((prevContacts) => prevContacts.filter(contact => contact.id !== contactId));
    }
  };
  
  useEffect(() => {
    if (!session?.user?.id) return;
    const userId = session.user.id;

    const fetchContacts = async () => {
      // Fetch user's contact UUIDs
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

      // Fetch contact details
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

  return (
    <div className="contacts-container">
      {/* Home button */}
      <div className="home-button" onClick={() => navigate("/home")}>
        <FaHome />  
      </div>

      <div className="contacts-header">
        <h1>Contacts</h1>

        {/* Search bar */}
        <div className="search-bar">
          <p>Search Contacts</p>
          <input type="text" placeholder="Name or email..." />
        </div>
      </div>
      
      {contacts.length === 0 ? (
        <p>You have no contacts.</p>
      ) : (
        <ul className="contacts-list">
          {contacts.map((contact) => (
            <li key={contact.id} className="contact-card">
              <div>
                <h3>{`${contact.first_name} ${contact.last_name}`}</h3>
                <p>Email: {contact.email}</p>
                <p>Timezone: {contact.timezone}</p>
              </div>
              <button className="delete-button" onClick={() => handleDelete(contact.id)}>
                <MdDeleteForever />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
