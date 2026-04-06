import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { FaMoon } from "react-icons/fa";
import { IoMenu } from "react-icons/io5";
import axios from "axios";
import SavedVideosContext from "../../createContext";
import { FaUser } from "react-icons/fa";
import { MdOutlineVideoLibrary } from "react-icons/md";
import "./index.css";
import api from "../../api-request-interceptor.jsx";

const navigationList = [
  { link: "/home", navText: "Home" },
  { link: "/trending", navText: "Movies" },
  { link: "/anime", navText: "Anime" },
  { link: "/documentary", navText: "Documentary" },
  { link: "/tv", navText: "TV" },
];

const Header = () => {
  const { darkMode, toggleDarkMode } = useContext(SavedVideosContext);
  const [t, setT] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem("user") !== null;

  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/logout",
        {},
        { withCredentials: true },
      );
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  const toggleLogout = (prev) => {
    setT((prev) => !prev);
  };

  return (
    <header className={`navbar ${darkMode ? "dark" : ""}`}>
      {/* Logo */}
      <Link to="/home" className="logo">
        NxtWatch
      </Link>

      {/* Desktop Navigation */}
      <nav className="nav-links">
        {navigationList.map((nav) => (
          <Link
            key={nav.link}
            to={nav.link}
            className={`nav-item ${
              location.pathname === nav.link ? "active" : ""
            }`}
          >
            {nav.navText}
          </Link>
        ))}
      </nav>

      <div className="nav-search">
        <input
          type="text"
          placeholder="Search movies, anime..."
          className="search-input"
          onClick={() => navigate("/search-engine")}
        />
      </div>

      {/* Right Side */}
      <div className="nav-right">
        <FaMoon className="icon-btn" onClick={toggleDarkMode} />
        <FaUser className="icon-btn"  onClick={toggleLogout} />
        {api && (
          <>
            {isLoggedIn ? (
              <button className="btn-primary" onClick={logout}>
                Logout
              </button>
            ) : (
              <Link to="/login">
                <button className="btn-primary">Login</button>
              </Link>
            )}
            {isLoggedIn && (
              <MdOutlineVideoLibrary
                onClick={() => navigate("/library")}
                className="icon-btn"
              />
            )}
          </>
        )}

        <IoMenu className="menu-icon" onClick={() => setMenuOpen(!menuOpen)} />
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="mobile-menu">
          {navigationList.map((nav) => (
            <Link
              key={nav.link}
              to={nav.link}
              onClick={() => setMenuOpen(false)}
              className="mobile-item"
            >
              {nav.navText}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
