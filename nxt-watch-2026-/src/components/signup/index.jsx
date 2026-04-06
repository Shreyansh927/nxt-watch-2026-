import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast  } from "react-toastify";

import axios from "axios";
const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [publicId, setPublicId] = useState("");
  const navigate = useNavigate();

  const signUp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/signup",
        {
          name,
          email,
          password,
          public_id: publicId,
        },
        {
          withCredentials: true,
        },
      );

      navigate("/login");
      toast.success(res.data.message || "Signup successful! Please log in.");
    } catch (err) {
      toast.error(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* LEFT SIDE - SAME GIF */}
      <div className="auth-left">
        <img
          src="https://i.gifer.com/AuEx.gif"
          alt="animation"
          className="auth-gif"
        />
      </div>

      {/* RIGHT SIDE - SIGNUP */}
      <div className="auth-right">
        <div className="login-card">
          <img
            src="https://assets.ccbp.in/frontend/react-js/nxt-watch-logo-light-theme-img.png"
            alt=""
            style={{ width: "50%", height: "40px", marginBottom: "20px" }}
          />
          <p>Join and start your journey</p>

          <form onSubmit={signUp}>
            <div className="input-group">
              <input
                type="text"
                placeholder=" "
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <label>Name</label>
            </div>

            <div className="input-group">
              <input
                type="email"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label>Email</label>
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label>Password</label>
            </div>

            <div className="input-group">
              <input
                type="text"
                placeholder=" "
                value={publicId}
                onChange={(e) => setPublicId(e.target.value)}
                required
              />
              <label>Public ID</label>
            </div>

            <button type="submit">Sign Up</button>
          </form>

          <span className="footer-text">
            Already have an account? <a href="/login">Login</a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
