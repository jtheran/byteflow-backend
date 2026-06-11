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
        EMAIL_FROM: process.env.EMAIL_FROM || "ByteFlow <no-reply@byteflowpos.com" 
    },
    get databaseURL(){
        return  `postgresql://${this.postgres.username}:${this.postgres.password}@${this.postgres.host}:${this.postgres.port}/${this.postgres.database}?schema=public`;
    }
}

export default config;