import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const res = await axios.get("http://localhost:5000/api/me", {
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
        "http://localhost:5000/api/login",
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
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (err) {
      console.log(err);
    } finally {
      navigate("/home");
    }
  };
  return (
    <div>
      <h1>Login Page</h1>
      <p>This is where users can log in to their account.</p>
      <form onSubmit={login}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
