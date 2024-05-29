import "dotenv/config"
import z from "zod";
import { parseEnv } from "znv";

const createConfigFromEnvironment = (environment: NodeJS.ProcessEnv) => {
    const config = parseEnv(environment, {
        NODE_ENV: z.enum(["development", "production"]),
        MONGO_URL: z.string(),
        DB_NAME: z.string(),
        PORT: z.number(),
    });

    return {
        ...config,
    };
};

export type Config = ReturnType<typeof createConfigFromEnvironment>;

const config = createConfigFromEnvironment(process.env);

export default config