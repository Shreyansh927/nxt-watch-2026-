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
import api from "./api-request-interceptor.jsx";

import "./App.css";
import Library from "./components/library";
import WatchHistory from "./components/watch-history/watch-history";
import SearchEngine from "./components/search-engine/search-engine";
import WatchLater from "./components/watch-later";
import WatchLaterFile from "./components/watch-later-file";
import WatchLaterFiles from "./components/watch-later-file";
import Recharts from "./components/recharts/index.jsx";
import AnalyticsDashboard from "./components/recharts/index.jsx";
import Header from "./components/header/index.jsx";

class App extends Component {
  render() {
    return (
      <>
        <Header />
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trending"
            element={
              <ProtectedRoute>
                <Trending />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/anime"
            element={
              <ProtectedRoute>
                <Anime />
              </ProtectedRoute>
            }
          />

          <Route
            path="/documentary"
            element={
              <ProtectedRoute>
                <Documentry />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tv"
            element={
              <ProtectedRoute>
                <Tv />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trending/:title/:id"
            element={
              <ProtectedRoute>
                <EachMovie />
              </ProtectedRoute>
            }
          />
          <Route
            path="/share/:id"
            element={
              // <ProtectedRoute>
              <EachMovie />
              // </ProtectedRoute>
            }
          />

          <Route
            path="/search-engine"
            element={
              <ProtectedRoute>
                <SearchEngine />
              </ProtectedRoute>
            }
          />
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <Library />
              </ProtectedRoute>
            }
          />

          <Route
            path="/library/watch-history"
            element={
              <ProtectedRoute>
                <WatchHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/library/watch-later"
            element={
              <ProtectedRoute>
                <WatchLater />
              </ProtectedRoute>
            }
          />
          <Route
            path="/folders/:folderId"
            element={
              <ProtectedRoute>
                <WatchLaterFiles />
              </ProtectedRoute>
            }
          />
        </Routes>
      </>
    );
  }
}

export default App;
