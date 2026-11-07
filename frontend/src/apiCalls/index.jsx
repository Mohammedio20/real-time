import axios from "axios";

export const url = "https://real-time-u7p2.onrender.com";
export const axiosInstance = axios.create({
  headers: {
    authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.set("authorization", `Bearer ${token}`);
  }

  return config;
});
