import axios from "axios";

export const url = "http://localhost:3000";
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
