import app from './app';
import config from './config/config'
import { initializeDatabase } from './seed/seedBasic';

//Iniciar Colas
import './job/email.worker';

const startServer = async () => {
    try {
      await initializeDatabase();

      app.listen(config.PORT, () => {
        console.log(`=================================`);
        console.log(` 🚀 ByteFlow Backend online`);
        console.log(` ⚡ Puerto: http://localhost:${config.PORT}`);
        console.log(` 🛠️  Ambiente: ${config.NODE_ENV}`);
        console.log(`=================================`);
      });
    } catch (error) {
      console.error('❌ Error al iniciar el servidor:', error);
      process.exit(1);
    }
  };
  
  startServer();