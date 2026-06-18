import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

const env = dotenv.config();
dotenvExpand.expand(env);

const config = {
    PORT: process.env.PORT || "2000",
    NODE_ENV: process.env.NODE_ENV || "development",
    JWT_SECRET: process.env.JWT_SECRET || "zaqwer",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'qwerty',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:16379',

    //Config DB
    postgres: {
        host: process.env.POSTGRES_HOST!,
        port: Number(process.env.POSTGRES_PORT),
        database: process.env.POSTGRES_DB!,
        username: process.env.POSTGRES_USER!,
        password: process.env.POSTGRES_PASSWORD!,
    },

    //Config Email
    mail: {
        SMTP_HOST: process.env.SMTP_HOST || "localhost",
        SMTP_PORT: process.env.SMTP_PORT || "1025",
        SMTP_USER: process.env.SMTP_USER || "",
        SMTP_PASS: process.env.SMTP_PASS || "",
        EMAIL_FROM: process.env.EMAIL_FROM || "ByteFlow <no-reply@byteflow.com" 
    },

    //Config Whatsaap
    wsp: {
        URL: process.env.WSP_API_URL || "http://localhost:2785/api",
        KEY: process.env.WSP_API_KEY || "ByteForge2026",
        SESSION_ID: process.env.WSP_SESSION_ID || ""
    },

    //Config IA
    ia: {
        URL: process.env.IA_BASE_URL || "http://localhost:1234/api/v1",
        API_KEY: process.env.AI_API_KEY || "hola mundo",
        MODEL_EMBEDDING: process.env.IA_MODEL_EMBEDDING || "openai/text-embedding-3-small",
        MODEL_CHAT: process.env.IA_MODEL_CHAT || "qwen/qwen3-32b:free"
    },

    //Config DB Vectores
    qdrant: {
        URL: process.env.QDRANT_URL || "http://localhost:6336",
        COLLECTION_NAME: process.env.QDRANT_COLLECTION_NAME || "byteflow_docs",
        SIZE: parseInt(process.env.QDRANT_VECTOR_SIZE || "1536")
    },

    //Config Stock Product
    stock: {
        MIN: parseInt(process.env.STOCK_MIN || "10"),
        MAX: parseInt(process.env.STOCK_MAX || "150")
    },
    //Config DB Relacional
    get databaseURL(){
        return  `postgresql://${this.postgres.username}:${this.postgres.password}@${this.postgres.host}:${this.postgres.port}/${this.postgres.database}?schema=public`;
    }
}

export default config;