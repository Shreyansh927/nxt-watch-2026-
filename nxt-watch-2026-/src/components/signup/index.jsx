import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [publicId, setPublicId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return false;
    }
    if (!email.trim()) {
      toast.error("Please enter your email");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    if (!publicId.trim()) {
      toast.error("Please enter a public ID");
      return false;
    }
    if (!agreedToTerms) {
      toast.error("Please agree to the terms and conditions");
      return false;
    }
    return true;
  };

  const getPasswordStrength = () => {
    if (!password) return "none";
    if (password.length < 6) return "weak";
    if (password.length < 10) return "medium";
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return "strong";
    return "medium";
  };

  const signUp = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/signup`,
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

      toast.success(res.data.message || "Signup successful! Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="auth-wrapper">
      {/* LEFT SIDE - BRANDING & ANIMATION */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-left-glow"></div>
          <img
            src="https://i.gifer.com/AuEx.gif"
            alt="animation"
            className="auth-gif"
          />
          <div className="auth-left-text">
            <h2>Join Our Community</h2>
            <p>Start exploring amazing content today</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - SIGNUP FORM */}
      <div className="auth-right">
        <div className="login-card">
          <div className="card-header">
            <img
              src="https://assets.ccbp.in/frontend/react-js/nxt-watch-logo-light-theme-img.png"
              alt="Logo"
              className="logo"
            />
            <div className="header-text">
              <h1>Create Account</h1>
              <p>Join and start your journey</p>
            </div>
          </div>

          <form onSubmit={signUp} className="login-form signup-form">
            <div className="input-group">
              <input
                type="text"
                placeholder=" "
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                autoComplete="name"
                required
              />
              <label className="form-label">Full Name</label>
            </div>

            <div className="input-group">
              <input
                type="email"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                autoComplete="email"
                required
              />
              <label className="form-label">Email Address</label>
            </div>

            <div className="input-group">
              <input
                type="text"
                placeholder=" "
                value={publicId}
                onChange={(e) => setPublicId(e.target.value)}
                className="form-input"
                required
              />
              <label className="form-label">Public ID</label>
            </div>

            <div className="input-group">
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  autoComplete="new-password"
                  required
                />
                <label className="form-label">
                  Password (min 6 characters)
                </label>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  )}
                </button>
              </div>

              {password && (
                <div
                  className={`password-strength strength-${passwordStrength}`}
                >
                  <div className="strength-bars">
                    <div className="strength-bar"></div>
                    <div className="strength-bar"></div>
                    <div className="strength-bar"></div>
                  </div>
                  <span className="strength-text">{passwordStrength}</span>
                </div>
              )}
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="checkbox-input"
                />
                <span className="checkbox-text">
                  I agree to the{" "}
                  <a href="#" className="terms-link">
                    Terms & Conditions
                  </a>
                </span>
              </label>
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="divider">or</div>

          <div className="signup-prompt">
            <span>Already have an account?</span>
            <a href="/login" className="signup-link">
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
