import OpenAI from 'openai';
import config from './config';

const iaClient = new OpenAI({
  apiKey: config.ia.API_KEY,
  baseURL: config.ia.URL,
});

export default iaClient;
