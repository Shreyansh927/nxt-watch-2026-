import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Header from "./components/header";

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <QueryClientProvider client={queryClient}>
    
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <App />
    </BrowserRouter>
  </QueryClientProvider>,
);
