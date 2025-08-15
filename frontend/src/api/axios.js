import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // change to your backend URL
  withCredentials: true, // if using cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
