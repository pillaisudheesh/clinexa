import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:3000/api/v1",

  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("clinexa_access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("clinexa_access_token");

      localStorage.removeItem("clinexa_user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);
