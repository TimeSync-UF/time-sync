import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import {
    ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ZAxis, Cell, ReferenceLine
} from "recharts";
import { supabase } from "../AuthProvider.jsx";
import { AuthContext } from "../AuthProvider.jsx";
import { DateTime } from "luxon";
import "./CreateMeeting.css";
import { HiOutlineBarsArrowDown } from "react-icons/hi2";
import { set } from "date-fns";

export default function MeetingHeatmap() {
    const navigate = useNavigate();
    const { meetingId } = useParams();
    const { session } = useContext(AuthContext);
    const [participants, setParticipants] = useState([]);
    const [heatmapData, setHeatmapData] = useState([]);
    const [hostWorkRange, setHostWorkRange] = useState([0, 24]);
    const [bestTimes, setBestTimes] = useState([]);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    useEffect(() => {
        if (!session?.user?.id || !meetingId) return;

        const fetchUserAndParticipants = async () => {
            try {
                // Fetch meeting details
                const { data: meetingData, error: meetingError } = await supabase
                    .from("Meetings")
                    .select("host, participants, start_time, end_time")
                    .eq("id", meetingId)
                    .single();

                if (meetingError) throw meetingError;
                if (!meetingData || !meetingData.host || !meetingData.participants?.length) {
                    console.error("Invalid meeting data:", meetingData);
                    return;
                }

                setStartDate(meetingData.start_time);
                setEndDate(meetingData.end_time);

                const hostId = meetingData.host;

                // Fetch host's work range and timezone
                const { data: hostData, error: hostError } = await supabase
                    .from("Profiles")
                    .select("timezone, work_range")
                    .eq("id", hostId)
                    .single();

                if (hostError) throw hostError;
                if (!hostData) {
                    console.error("Host data not found for ID:", hostId);
                    return;
                }

                const hostTimezone = hostData.timezone;
                const [hostStart, hostEnd] = hostData.work_range || [0, 24];
                setHostWorkRange([hostStart, hostEnd]);
                const hostStartHour = parseInt(hostStart.split(":")[0], 10);
                const hostEndHour = parseInt(hostEnd.split(":")[0], 10);

                // Fetch participant details
                const { data: participantDetails, error: participantError } = await supabase
                    .from("Profiles")
                    .select("id, first_name, last_name, email, timezone, work_range")
                    .in("id", meetingData.participants);

                if (participantError) throw participantError;
                setParticipants(participantDetails || []);

                // Convert participant work hours to host's timezone
                const hourAvailability = new Array(24).fill(0);
                participantDetails.forEach(({ work_range, timezone }) => {
                    if (!work_range || work_range.length < 2) return;

                    let [start, end] = work_range;

                    // Convert to host's time zone
                    let startTime = DateTime.fromFormat(start, "HH:mm:ss", { zone: timezone });
                    let endTime = DateTime.fromFormat(end, "HH:mm:ss", { zone: timezone });

                    // Convert to host's time zone
                    startTime = startTime.setZone(hostTimezone);
                    endTime = endTime.setZone(hostTimezone);

                    // Adjust start and end time hours to integers for easier comparison
                    let startHostHour = startTime.hour;
                    let endHostHour = endTime.hour;


                    // Host work range is also converted to DateTime objects for comparison
                    let hostStartTime = DateTime.fromFormat(hostStart, "HH:mm:ss", { zone: hostTimezone });
                    let hostEndTime = DateTime.fromFormat(hostEnd, "HH:mm:ss", { zone: hostTimezone });


                    // Loop over the participant's work range and check if the hour is within the host's work range
                    for (let hour = startHostHour; hour < endHostHour; hour++) {
                        hourAvailability[hour]++;
                    }                                      
                });

                console.log("Participants:", participantDetails);
                console.log("Hour availability:", hourAvailability);

                // Format heatmap data
                const formattedHeatmapData = hourAvailability.map((count, hour) => {
                    return { x: hour, y: 1, z: count };
                }).filter(Boolean); // Filter out null values (those outside of host work range)

                console.log("Formatted Heatmap Data:", formattedHeatmapData);
                setHeatmapData(formattedHeatmapData);

                const maxCount = Math.max(...formattedHeatmapData.map(entry => entry.z));
                const bestTimesCalculated = formattedHeatmapData.filter(entry => entry.z === maxCount).map(entry => `${entry.x}:00`);
                setBestTimes(bestTimesCalculated);

            } catch (error) {
                console.error("Error fetching participants:", error.message);
            }
        };

        fetchUserAndParticipants();
    }, [meetingId, session]);

    // Gradient fill function based on the count of participants
    const colorRange = (count) => {
        if (count === 0) return "#f0f0f0";
        if (count === 1) return "#B5C7E8"; 
        if (count <= 2) return "#6B8DFF";  
        if (count <= 5) return "#1d2d44";  
        return "#1d2d44";                  
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!startTime || !endTime) {
            alert("Please fill in all fields.");
            return;
        }
    
        if (endTime <= startTime) {
            alert("End time must be after start time.");
            return;
        }
        
        console.log("Submitting meeting with times:", startTime, endTime);
        
        try {
            const startDateTime = new Date(startDate);
            const endDateTime = new Date(endDate);
            
            // Get start and end hours and minutes from the time strings
            const [startHours, startMinutes] = startTime.split(':').map(Number);
            const [endHours, endMinutes] = endTime.split(':').map(Number);
            
            // Set the hours and minutes on the date objects
            startDateTime.setHours(startHours, startMinutes, 0);
            endDateTime.setHours(endHours, endMinutes, 0);
                        
            const { data, error } = await supabase
                .from("Meetings")
                .upsert({
                    id: meetingId,
                    start_time: startDateTime.toISOString(),
                    end_time: endDateTime.toISOString(),
                })
                .select("id")
                .single();

            if (error) {
                alert("Error saving meeting: " + error.message);
                return;
            }
            navigate(`/meeting/${meetingId}`);

        } catch (err) {
            console.error("Exception during meeting save:", err);
            alert("An error occurred: " + err.message);
        }
    }

    // if user clicks, should ask if they want to leave before finishing meeting. if yes, delete meeting
    const handleHomeButton = async () => {
        if (window.confirm("Are you sure you want to leave? New meeting data will be lost.")) {
            const {data, error} = await supabase
            .from("Meetings")
            .delete()
            .eq("id", meetingId);
            
            if(error) {
                console.error("Error deleting meeting:", error.message);
                alert("Error deleting meeting: " + error.message);
                return;
            }
            alert("Meeting deleted");
            navigate("/home"); // Redirect to home after successful deletion
        }
    }

    return (
        <div>
            {/* Home Button */}
            <div className="home-button" onClick={() => handleHomeButton()}>
                <FaHome />
                Home
            </div>

            <h1>Meeting Heatmap</h1>
            <h4>This is calculated by looking at all participants' timezones.</h4>
            <h4>The darker the color & larger the square, the more participants are available — across all hours.</h4>

            <ResponsiveContainer width="100%" height={125}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
                    <XAxis 
                        type="number"
                        dataKey="x"
                        name="Hour"
                        domain={[0, 23]} 
                        tickFormatter={(hour) => `${hour}:00`} 
                        tickCount={24} 
                    />
                    <YAxis type="number" dataKey="y" name="Row" hide />
                    <ZAxis type="number" dataKey="z" name="Participants" range={[100, 800]} />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Scatter
                        data={heatmapData}
                        shape="square"
                    >
                        {heatmapData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colorRange(entry.z)} />
                        ))}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>

            {/* Map times at whcih participant max is available
            <h4>
                {bestTimes.length === 1 
                    ? `*The best time for meeting is ${bestTimes[0]}`
                    : bestTimes.length > 1
                        ? `*The best times for meeting are ${bestTimes.join(", ")}`
                        : "No available times found."}
            </h4>  */}

            <div className="create-meeting-container">
                <div className="form-group-time">
                    {/* Start Time Input */}
                    <div className="time-container">
                        <label htmlFor="start-time">Start Time:</label>
                        <input
                        id="start-time"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="form-input-time"
                        required
                        />

                    {/* End Time Input */}
                        <label htmlFor="end-time">End Time:</label>
                        <input
                        id="end-time"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="form-input-time"
                        required
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button className="save-button" onClick={handleSubmit}>Finalize Meeting</button>
            </div>
        </div>
    );
}
