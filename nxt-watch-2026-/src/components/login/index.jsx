import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "./index.css";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const res = await axios.get(`${process.env.SERVER_URL}/api/me`, {
        withCredentials: true,
      });
      if (res.data.user) {
        navigate("/home", { replace: true });
      }
    };
    fetchCurrentUser();
  }, []);
  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${process.env.SERVER_URL}/api/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        },
      );
      console.log(res.data.message);
      console.log(res.data.user);
      toast.success(res.data.message || "Login successful!");
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (err) {
      toast.error(err.response?.data?.error || err.message);
    } finally {
      navigate("/home");
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
            style={{width: "50%", height:"40px", marginBottom: "20px"}}
          />
          <p>Access your powerful dashboard</p>

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

            <button type="submit" className="login-button">Login</button>
          </form>

          <span className="footer-text">
            Don’t have an account? <a href="/signup">Sign up</a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
