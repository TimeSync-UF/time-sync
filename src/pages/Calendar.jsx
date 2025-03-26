import {useState, useEffect} from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import "./Calendar.css"
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import { useNavigate, useParams } from "react-router-dom";

const locales = {
    "en-US": enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
    getDay,
    locales,
});

// placeholders for now
const events = [
    {
        title: "Meeting with Team",
        start: new Date(2025, 2, 27, 10, 0),
        end: new Date(2025, 2, 27, 12, 0),
        allDay: false,
    },
    {
        title: "Lunch with Client",
        start: new Date(2025, 2, 28, 13, 0),
        end: new Date(2025, 2, 28, 14, 0),
        allDay: false,
    },
];

export default function HomeCalendar() {
    const navigate = useNavigate();
    const [timeZone, setTimeZone] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }, []);

    const toggleDropdown = () => {
        setShowDropdown((prev) => !prev);
    };

    return (
        <div>
            <button className="hamburger-menu" onClick={toggleDropdown}>
                <GiHamburgerMenu />
                {showDropdown && (
                    <div className="filter-dropdown">
                        <ul>
                            <li onClick={() => navigate("/create-meeting")}>Create Meeting</li>
                            <li onClick={() => navigate("/upcoming-meetings")}>Upcoming Meetings</li>
                            <li onClick={() => navigate("/previous-meetings")}>Previous Meetings</li>
                            <li onClick={() => navigate("/FAQ")}>FAQ</li>
                        </ul>
                    </div>
                )}
            </button>
            
            <h1>Hi, User!</h1>
            <p>Your timezone: {timeZone}</p>
            <div style={{ height: "500px" }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "100%", width: "100%" }}
                />
            </div>
        </div>
    );
}
