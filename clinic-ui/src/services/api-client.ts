import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("samaroot_access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Allow Axios/browser to set multipart/form-data with its boundary.
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      config.headers.delete("Content-Type");
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("samaroot_access_token");
      localStorage.removeItem("samaroot_user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);
