import "dotenv/config";
import { defineConfig } from "prisma/config";
import config from './src/config/config';

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: config.databaseURL,
  },
});
