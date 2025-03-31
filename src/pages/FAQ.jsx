import React, { useState } from 'react';
import './FAQ.css';
import { FaChevronDown, FaChevronUp, FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const faqs = [
  {
    question: 'HOW DOES THIS APP HANDLE DIFFERENT TIMEZONES?',
    answer: `Our app automatically detects each user's local timezone and converts all meeting times accordingly.\n\nWhen you schedule or view a meeting, you'll always see it in your own timezone — and the other participants will see it in theirs.\n\nNo need to calculate time differences or worry about daylight saving changes — we handle all of that in the background to make scheduling seamless across the globe.`,
  },
  {
    question: 'WHAT HAPPENS IF SOMEONE CHANGES THEIR TIME ZONE?',
    answer: `If a participant changes their timezone, our app will automatically update all scheduled meeting times for everyone involved.`,
  },
  {
    question: 'IS THIS APP FREE TO USE?',
    answer: `Yes! The core features are completely free to use. We also offer premium features for teams or advanced scheduling needs.`,
  },
  {
    question: 'CAN OTHERS SEE MY CALENDAR?',
    answer: `Only the availability you choose to share is visible to others. Your personal event details remain private.`,
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate();

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <button className="home-button" onClick={() => navigate('/')}>
        <FaHome /> Home
      </button>

      <h1 className="faq-heading">Frequently Asked Questions</h1>

      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`faq-item ${openIndex === index ? 'open' : ''}`}
            onClick={() => toggleFAQ(index)}
          >
            <div className="faq-question">
              <span>{faq.question}</span>
              <span
                className={`faq-arrow ${openIndex === index ? 'rotate-open' : ''}`}
              >
                {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </div>

            <div className="faq-answer-wrapper">
              {openIndex === index && (
                <div className="faq-answer">
                  {faq.answer.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

