import React, { useState } from 'react';
import './Contacts.css';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import { FaHome } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

export default function Contacts() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({
    name: '',
    timezone: '',
    email: '',
  });

  const [editIndex, setEditIndex] = useState(null);
  const [editContact, setEditContact] = useState({ name: '', timezone: '', email: '' });

  const handleInputChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    if (isEdit) {
      setEditContact({ ...editContact, [name]: value });
    } else {
      setNewContact({ ...newContact, [name]: value });
    }
  };

  const handleSave = () => {
    if (newContact.name && newContact.email && newContact.timezone) {
      setContacts([...contacts, newContact]);
      setNewContact({ name: '', timezone: '', email: '' });
      setShowForm(false);
    } else {
      alert('Please fill out all fields.');
    }
  };

  const handleEditClick = (index) => {
    setEditIndex(index);
    setEditContact(contacts[index]);
  };

  const handleEditSave = () => {
    const updatedContacts = [...contacts];
    updatedContacts[editIndex] = editContact;
    setContacts(updatedContacts);
    setEditIndex(null);
    setEditContact({ name: '', timezone: '', email: '' });
  };

  const handleDelete = (index) => {
    const updatedContacts = contacts.filter((_, i) => i !== index);
    setContacts(updatedContacts);
  };

  const handleCancelAdd = () => {
    setNewContact({ name: '', timezone: '', email: '' });
    setShowForm(false);
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
    setEditContact({ name: '', timezone: '', email: '' });
  };

  return (
    <div className="contacts-container">
      {/* Home Button */}
      <button className="home-button" onClick={() => navigate('/')}>
        <FaHome /> Home
      </button>
      
      <h1>Contacts</h1>
      <div className="button-group">
        <button className="add-button" onClick={() => setShowForm(true)}>
          Add Contact
        </button>
        <button className="edit-button" onClick={() => setIsEditingMode(!isEditingMode)}>
          Edit Contacts
        </button>
      </div>

      <hr className="contacts-divider" />

      {showForm && (
        <div className="contact-form">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={newContact.name}
            onChange={(e) => handleInputChange(e)}
          />
          <input
            type="text"
            name="timezone"
            placeholder="Timezone"
            value={newContact.timezone}
            onChange={(e) => handleInputChange(e)}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={newContact.email}
            onChange={(e) => handleInputChange(e)}
          />
          <div className="form-buttons">
            <button className="save-button" onClick={handleSave}>
              Save
            </button>
            <button className="cancel-button" onClick={handleCancelAdd}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="contacts-list">
        {contacts.map((contact, index) => (
          <div className="contact-card" key={index}>
            {isEditingMode && editIndex !== index && (
              <FaEdit className="edit-icon" onClick={() => handleEditClick(index)} />
            )}
            {isEditingMode && editIndex === index && (
              <MdDeleteForever className="remove-icon" onClick={() => handleDelete(index)} />
            )}

            {editIndex === index ? (
              <div className="edit-fields">
                <input
                  type="text"
                  name="name"
                  value={editContact.name}
                  onChange={(e) => handleInputChange(e, true)}
                />
                <input
                  type="email"
                  name="email"
                  value={editContact.email}
                  onChange={(e) => handleInputChange(e, true)}
                />
                <input
                  type="text"
                  name="timezone"
                  value={editContact.timezone}
                  onChange={(e) => handleInputChange(e, true)}
                />
                <div className="form-buttons">
                  <button className="save-button" onClick={handleEditSave}>
                    Save
                  </button>
                  <button className="cancel-button" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="contact-content">
                <h3>{contact.name}</h3>
                <p>Email: {contact.email}</p>
                <p>Time Zone: {contact.timezone}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
