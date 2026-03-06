import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div>
      <h1>Sign Up Page</h1>
      <p>This is where users can sign up for an account.</p>
      <form onSubmit={signUp}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Public ID"
          value={publicId}
          onChange={(e) => setPublicId(e.target.value)}
          required
          // onKeyDown={(e) => {
          //   if (e.key === "Enter") {
          //     signUp();
          //   }
          // }}
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;
