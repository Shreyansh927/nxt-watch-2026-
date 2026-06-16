import React, { useState, useEffect } from "react";
import api from "../../api-request-interceptor.jsx";

const Sessions = () => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get("/all-current-sessions", {
          withCredentials: true,
        });
        setSessions(res.data.sessions);
      } catch (err) {
        console.log("Error fetching sessions:", err);
      }
    };
    fetchSessions();
  }, []);
  return (
    <div>
      <h2>All Sessions</h2>
      <p>
        This page will display all active sessions for the logged-in user,
        allowing them to manage and log out of specific sessions if needed.
      </p>
      <ul>
        {sessions.map((session, i) => (
          <li
            key={i}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <p>
              <strong>Session {i + 1}:</strong>
            </p>
            <p>Created At: {new Date(session.createdAt).toLocaleString()}</p>
            <p>Device Info: {session.deviceInfo}</p>
            <p>IP Location Info: {session.ipLocationInfo}</p>
            <p>Country: {session.country}</p>
            <p>City: {session.city}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sessions;
