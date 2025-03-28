import { useState, useEffect, useContext } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import "./Calendar.css";
import { Calendar, globalizeLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import globalize from "globalize";
import { useNavigate } from "react-router-dom";
import { supabase, AuthContext } from "../AuthProvider.jsx";

const localizer = globalizeLocalizer(globalize);

export default function HomeCalendar() {
    const navigate = useNavigate();
    const [timeZone, setTimeZone] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [currentView, setCurrentView] = useState("month"); 
    const [date, setDate] = useState(new Date()); // Track the current date
    const { session } = useContext(AuthContext);
    const [firstName, setFirstName] = useState("");
    const [events, setEvents] = useState([]); // Removed sample events

    useEffect(() => {
        setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);

        if (!session?.user?.id) return;
        const userId = session.user.id;

        const fetchUserProfile = async () => {
          const { data, error } = await supabase
            .from("Profiles")
            .select("first_name, id")  
            .eq("id", userId)
            .single();

          if (error) {
            console.error("Error fetching profile:", error.message);
            return;
          }

          console.log("Fetched user profile:", data);
          setFirstName(data.first_name);

          // Fetch the meetings
          fetchMeetings(data.id);
        };

        fetchUserProfile();
    }, [session]);

    const fetchMeetings = async (profileId) => {
        console.log("Fetching meetings for profileId:", profileId);

        const { data, error } = await supabase
          .from("Meetings")
          .select("id, host, start_time, end_time, participants, title")
          .eq("host", profileId);

        if (error) {
          console.error("Error fetching meetings:", error.message);
          return;
        }

        console.log("Fetched meetings:", data);

        if (data && data.length > 0) {
          const formattedEvents = data.map((meeting) => ({
            title: meeting.title || `Meeting ID: ${meeting.id}`,
            start: new Date(meeting.start_time),
            end: new Date(meeting.end_time),
            allDay: false,
          }));
          setEvents(formattedEvents);
        } else {
          console.log("No meetings found for this host.");
        }
    };

    const toggleDropdown = () => {
        setShowDropdown((prev) => !prev);
    };

    // Handle navigation (Today, Next, Back)
    const handleNavigate = (newDate) => {
        setDate(newDate);
    };

    return (
        <div>
            <button className="hamburger-menu" onClick={toggleDropdown}>
                <GiHamburgerMenu />
                {showDropdown && (
                    <div className="filter-dropdown">
                        <ul>
                            <li onClick={() => navigate("/create-meeting")}>Create Meeting</li>
                            <li onClick={() => navigate("/contacts")}>Contacts</li>
                            <li onClick={() => navigate("/previous-meetings")}>Previous Meetings</li>
                            <li onClick={() => navigate("/FAQ")}>FAQ</li>
                        </ul>
                    </div>
                )}
            </button>
            
            <h1>Hi, {firstName}!</h1>
            <p>Your timezone: {timeZone}</p>
            <div style={{ height: "500px" }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    defaultView="month"
                    view={currentView}
                    onView={(view) => setCurrentView(view)}
                    date={date} // Bind to current date state
                    onNavigate={handleNavigate} // Handle navigation
                    style={{ height: "100%", width: "100%" }}
                />
            </div>
        </div>
    );
}
