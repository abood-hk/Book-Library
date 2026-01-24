import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json', // <- default for all requests
  },
});

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

api.interceptors.request.use((req) => {
  if (accessToken) {
    req.headers = req.headers ?? {};
    req.headers.Authorization = `Bearer ${accessToken}`;
  }
  return req;
});

export default api;
