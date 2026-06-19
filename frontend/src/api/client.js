import axios from 'axios';

// Single axios instance. `withCredentials` makes the browser send/receive the
// httpOnly auth cookie on every request.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Normalize backend errors to a plain Error with the server's message.
export const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong';
