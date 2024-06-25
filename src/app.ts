import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import cors from "cors";

import config from './configs/env';
import { fileRouter } from './routes';

const app = express();

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/static', express.static(path.join(__dirname, 'static')))

app.use('/files', fileRouter)

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    if (typeof error === "string") {
        return res.status(400).json({ message: error });
    }
    console.error(error)
    return res.status(500).json({ message: "Error" });
});

mongoose.connect(config.MONGO_URL, { dbName: config.DB_NAME }).then(async () => {
    console.info("MongoDB connected");
    app.listen(config.PORT, () => {
        console.log(`Server running at http://localhost:${config.PORT}`);
    });
});