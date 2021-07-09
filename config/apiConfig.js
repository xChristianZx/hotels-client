import axios from 'axios';
import { getSession } from 'next-auth/client';

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_HOTELS_API_URL
    : 'http://localhost:4000/';

axios.defaults.baseURL = BASE_URL;

axios.defaults.headers = {
  'Content-Type': 'application/json',
  accept: 'application/json',
};

axios.interceptors.request.use(async config => {
  const session = await getSession();

  config.headers.Authorization = `Bearer ${session?.accessToken}`;

  return config;
});

export default axios;
