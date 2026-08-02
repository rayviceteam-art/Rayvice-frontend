import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://rayvice-backend.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});
