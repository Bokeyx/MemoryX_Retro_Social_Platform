import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://memory-x.duckdns.org:8080';

const login = (id, password) =>
  axios.post(`${API_BASE_URL}/auth/login`, { id, password }).then((res) => res.data);

export default { login };
