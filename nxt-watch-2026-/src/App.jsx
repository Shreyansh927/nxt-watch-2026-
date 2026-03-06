import { Routes, Route } from "react-router-dom";
import { toast } from "react-toastify";
import { Component } from "react";
import Login from "./components/login";
import Home from "./components/home";
import Trending from "./components/trending";
import ProtectedRoute from "./components/protectedRoute";
import EachMovie from "./components/eachMovie";
import Anime from "./components/Anime";
import Documentry from "./components/documentary";
import Tv from "./components/tv";
import SavedVideosContext from "./createContext";
import Signup from "./components/signup";

import "./App.css";
import Library from "./components/library";
import WatchHistory from "./components/watch-history/watch-history";
import SearchEngine from "./components/search-engine/search-engine";
import WatchLater from "./components/watch-later";
import WatchLaterFile from "./components/watch-later-file";
import WatchLaterFiles from "./components/watch-later-file";

class App extends Component {
  state = {
    savedVideosList: JSON.parse(localStorage.getItem("saved-videos")) || [],
    darkMode: JSON.parse(localStorage.getItem("toggle")) || false,
  };

  toggleDarkMode = () => {
    this.setState((prev) => ({ darkMode: !prev.darkMode }));
  };

  componentDidUpdate = (_, prev) => {
    const { savedVideosList, darkMode } = this.state;

    if (prev.savedVideosList !== savedVideosList) {
      localStorage.setItem("saved-videos", JSON.stringify(savedVideosList));
    }

    if (prev.darkMode !== darkMode) {
      localStorage.setItem("toggle", JSON.stringify(darkMode));
    }
  };

  addVideo = (newVideo) => {
    this.setState((prevState) => {
      const alreadyAdded = prevState.savedVideosList.some(
        (vid) => vid.id === newVideo.id,
      );

      if (alreadyAdded) {
        toast.info("Movie already added");
        return null;
      }

      toast.success("Movie successfully saved");
      return {
        savedVideosList: [newVideo, ...prevState.savedVideosList],
      };
    });
  };

  removeVideo = (deleteVideo) => {
    const finalList = this.state.savedVideosList.filter(
      (video) => video.id !== deleteVideo.id,
    );

    toast.error("Movie removed from saved list");
    this.setState({ savedVideosList: finalList });
  };

  render() {
    const { savedVideosList, darkMode } = this.state;

    return (
      <SavedVideosContext.Provider
        value={{
          savedVideosList,
          darkMode,
          toggleDarkMode: this.toggleDarkMode,
          addVideo: this.addVideo,
          removeVideo: this.removeVideo,
        }}
      >
        <div
          style={{
            backgroundImage: darkMode
              ? "linear-gradient(135deg, #1f1f1f, #2c2c2c)"
              : "linear-gradient(135deg, white, white)",
            color: darkMode ? "#fff" : "#000",
          }}
        >
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            <Route path="/home" element={<Home />} />

            <Route path="/trending" element={<Trending />} />

            <Route path="/anime" element={<Anime />} />

            <Route path="/documentary" element={<Documentry />} />

            <Route path="/tv" element={<Tv />} />

            <Route path="/trending/:title/:id" element={<EachMovie />} />

            <Route path="/search-engine" element={<SearchEngine />} />
            <Route path="/library" element={<Library />} />

            <Route path="/library/watch-history" element={<WatchHistory />} />
            <Route path="/library/watch-later" element={<WatchLater />} />
            <Route path="/folders/:folderId" element={<WatchLaterFiles />} />
          </Routes>
        </div>
      </SavedVideosContext.Provider>
    );
  }
}

export default App;
