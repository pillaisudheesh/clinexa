import React from "react";

import ReactDOM from "react-dom/client";

import { RouterProvider } from "react-router-dom";

import { AuthProvider } from "@/auth/auth-context";

import { router } from "./router";

import "./styles/globals.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);
