import { QdrantClient } from '@qdrant/js-client-rest';
import config from './config';

const qdrantClient = new QdrantClient({
  url: config.qdrant.URL,
  // apiKey: process.env.QDRANT_API_KEY // Descomentar si usas Qdrant Cloud
});

export default qdrantClient;