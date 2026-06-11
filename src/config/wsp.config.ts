import axios from 'axios';
import config from './config';

export const openWaClient = axios.create({
  baseURL: config.wsp.URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': config.wsp.KEY
  },
  timeout: 15000 // 15 segundos de timeout
});