import path from 'path';
import fs from 'fs';
import YAML from 'yamljs';
import config from './config';

const loadYamlFromDirectory = (relativeDirPath: string): Record<string, any> => {
  const absolutePath = path.join(__dirname, relativeDirPath);
  const mergedObjects: Record<string, any> = {};

  try {
    // 1. Verificar si la carpeta existe antes de leerla
    if (!fs.existsSync(absolutePath)) {
      console.warn(`⚠️ Advertencia: El directorio no existe: ${absolutePath}`);
      return mergedObjects;
    }

    // 2. Leer todos los archivos dentro de la carpeta
    const files = fs.readdirSync(absolutePath);

    // 3. Filtrar y cargar solo archivos que terminen en .yaml o .yml
    files.forEach((file) => {
      if (file.endsWith('.yaml') || file.endsWith('.yml')) {
        const filePath = path.join(absolutePath, file);
        const fileContent = YAML.load(filePath);

        // Combinamos las propiedades dentro del objeto global utilizando el spread operator
        if (fileContent && typeof fileContent === 'object') {
          Object.assign(mergedObjects, fileContent);
        }
      }
    });
  } catch (error) {
    console.error(`🚨 Error cargando archivos YAML desde ${absolutePath}:`, error);
  }

  return mergedObjects;
};

const schemasMerged = loadYamlFromDirectory('../docs/schemas');
const pathsMerged = loadYamlFromDirectory('../docs/routes');


export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'ByteFlow POS - API Documentation 🚀',
    version: '1.0.0',
    description: 'Documentación oficial de los endpoints del backend de ByteFlow, el sistema POS modular de alta velocidad.',
    termsOfService: 'https://byteforge.com/terms',
    contact: {
      name: 'ByteForge Support',
      email: 'soporte@byteforge.com',
      url: 'https://byteforge.com',
      phone: '3026973255'
    },
  },
  externalDocs: {
    description: 'Documentación Técnica Completa',
    url: 'https://docs.byteflow.com',
  },
  servers: [
    {
      url: `http://localhost:${config.PORT}`,
      description: 'Servidor de Desarrollo Local',
    },
  ],
  components: {
    // Configuración global para habilitar el candado de seguridad JWT en la UI
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Introduce tu token JWT en formato: Bearer {token}',
      },
    },
    schemas: {
      ...schemasMerged
    },
  },
  paths: {
    ...pathsMerged
  },
};