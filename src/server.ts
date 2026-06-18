import app from './app';
import http from 'http';
import config from './config/config'
import { initializeDatabase } from './seed/seedBasic';
import { initSocketServer } from './config/socket.config';
import { startQueues } from './utils/initQueue.util';
import { startWorkers } from './utils/initWorkers.util';
import './job/email.worker';
import './job/wsp.worker';

const server = http.createServer(app);

const startServer = async () => {
    try {
      await initializeDatabase();
      await startQueues();
      startWorkers();
      initSocketServer(server);
      server.listen(config.PORT, () => {
        console.log(`=================================`);
        console.log(` 🚀 ByteFlow Backend online`);
        console.log(` ⚡ Url: http://localhost:${config.PORT}`);
        console.log(` 🛠️ Ambiente: ${config.NODE_ENV}`);
        console.log(` 📚 Swagger: http://localhost:${config.PORT}/docs`);
        console.log(`=================================`);
      });
    } catch (error) {
      console.error('❌ Error al iniciar el servidor:', error);
      process.exit(1);
    }
  };
  
  startServer();