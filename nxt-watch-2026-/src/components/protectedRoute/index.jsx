import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import api from "../../api-request-interceptor.jsx";

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    api
      .get("/protected", { signal: controller.signal }) 
      .then(() => setIsAuth(true))
      .catch(() => setIsAuth(false));

    return () => controller.abort();
  }, []);

  if (isAuth === null) return <p>Loading...</p>;
  return isAuth ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
