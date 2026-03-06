import React, { useState } from "react";
import WatchHistory from "../watch-history/watch-history.jsx";
import Header from "../header/index.jsx";
import "./index.css";
import { useNavigate } from "react-router-dom";
import { IoMdAdd } from "react-icons/io";
import axios from "axios";
import WatchLater from "../watch-later/index.jsx";



const Library = () => {
  const navigate = useNavigate();
  
  return (
    <div className="main">
      <div
        style={{ marginLeft: "35px", marginRight: "30px" }}
        className="watch"
      >
        <h1>Watch History</h1>
        <button
          className="watch"
          onClick={() => navigate("/library/watch-history")}
        >
          Watch Full History
        </button>
      </div>
      <div style={{ paddingRight: "30px" }}>
        <WatchHistory />
      </div>
      <div className="hr-div">
        <hr />
        <hr />
      </div>
      
        <WatchLater />
      
    </div>
  );
};

export default Library;
