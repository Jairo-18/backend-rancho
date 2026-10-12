import 'reflect-metadata';
import { DataSource } from 'typeorm';
export declare const appConfig: {
    app: {
        name: string;
        env: "development" | "production" | "test";
        port: number;
        timezone: string;
        baseUrl: string;
        frontendUrl: string;
        trustProxy: boolean;
        cors: {
            origin: string[];
        };
    };
    db: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
        ssl: boolean;
    };
    jwt: {
        accessSecret: string;
        accessExpiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    swagger: {
        enabled: boolean;
        user: string;
        password: string;
    };
    uploads: {
        driver: "local";
        dir: string;
        maxMb: number;
    };
};
declare const _default: DataSource;
export default _default;
