import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "./index.css";
import { toast } from "react-toastify";
import api from "../../api-request-interceptor.jsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentSessions, setCurrentSessions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await api.get("/me");

        if (res.data.user) {
          navigate("/home", { replace: true });
        }
      } catch (err) {
        console.log("Not authenticated");
      }
    };

    fetchCurrentUser();
  }, []);
  const login = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/login", {
        email,
        password,
      });

      toast.success(res.data.message || "Login successful!");

      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/home");
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;

      toast.error(errorMessage);

      if (
        errorMessage ===
        "Device limit reached. Please log out from another device to continue."
      ) {
        setCurrentSessions(err.response.data.currentSessions || []);
        
      }
    }
  };
  return (
    <div className="auth-wrapper">
      {/* LEFT SIDE - GIF */}
      <div className="auth-left">
        <img
          src="https://i.gifer.com/AuEx.gif"
          alt="animation"
          className="auth-gif"
        />
      </div>

      {/* RIGHT SIDE - LOGIN */}
      <div className="auth-right">
        <div className="login-card">
          <img
            src="https://assets.ccbp.in/frontend/react-js/nxt-watch-logo-light-theme-img.png"
            alt=""
            style={{ width: "50%", height: "40px", marginBottom: "20px" }}
          />
          <p>Access your powerful dashboard</p>

          {currentSessions.length > 0 ? (
            <div className="current-sessions">
              <h3>Current Sessions</h3>
              <ul>
                {currentSessions.map((session, index) => (
                  <li key={index}>
                    <p>{session.deviceInfo}</p>
                    <p>{session.ipLocationInfo}</p>
                    <p>{session.country}</p>
                    <p>{session.city}</p>
                    <p>{new Date(session.createdAt).toLocaleString()}</p>

                    <button>Logout This Device</button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <>
              <form onSubmit={login}>
                <div className="input-group">
                  <input
                    type="email"
                    placeholder=" "
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label>Email</label>
                </div>

                <div className="input-group">
                  <input
                    type="password"
                    placeholder=" "
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label>Password</label>
                </div>

                <button type="submit" className="login-button">
                  Login
                </button>
              </form>

              <span className="footer-text">
                Don’t have an account? <a href="/signup">Sign up</a>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
