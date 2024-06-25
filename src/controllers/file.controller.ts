import { NextFunction, Request, Response } from "express";

import { createHash } from "crypto";
import { createReadStream, createWriteStream } from "fs";
import axios from "axios";
import { fromFile } from "file-type";
import FileModel from "../models/file.model";

export const getFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { url } = req.query
        if (!url) throw Error("invalidQuery")
        url = url.toString()
        let file = await FileModel.findById(url)
        if (!file) {
            file = await cacheFileFromUrl(url)
        }
        res.setHeader("content-type", file.mime);
        createReadStream(__dirname + "/../static/proxy/" + file.path).pipe(res)
    } catch (error) {
        next(error)
    }
}

export const postFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { url } = req.body
        if (!url) throw Error("Not found");
        let file = await FileModel.findById(url)
        if (!file) {
            file = await cacheFileFromUrl(url)
        }

        return res.json({ file })
    } catch (error) {
        next(error)
    }
}

function stringToUuid(str: string) {
    const hash = createHash('sha1').update(str).digest('hex');
    return [
        hash.substr(0, 8),
        hash.substr(8, 4),
        hash.substr(12, 4),
        hash.substr(16, 4),
        hash.substr(20, 12)
    ].join('-');
}

async function cacheFileFromUrl(url: string) {
    const id = stringToUuid(url)
    const path = __dirname + "/../static/proxy/" + id
    const fileStream = createWriteStream(path)
    const response = await axios({
        method: 'get',
        url: url,
        responseType: 'stream', // Important!
    });

    response.data.pipe(fileStream);

    // Wait for the download to complete
    await new Promise((resolve) => {
        fileStream.on('finish', resolve);
    });

    let fileType: any = await fromFile(path);

    if (!fileType) {
        fileType = {
            ext: "json",
            mime: "application/json"
        }
    }

    return await FileModel.create({ _id: url, mime: fileType.mime, path: id })
}