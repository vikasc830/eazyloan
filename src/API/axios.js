import axios from 'axios';
const instance = axios.create({
  baseURL: 'https://localhost:7202/', // change to match your API
  headers: {
    'Content-Type': 'application/json',
  }
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;


