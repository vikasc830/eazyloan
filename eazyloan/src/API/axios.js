import axios from 'axios';
const instance = axios.create({
  baseURL: 'https://localhost:7202/', // change to match your API
  headers: {
    'Content-Type': 'application/json',
  }
});

export default instance;
