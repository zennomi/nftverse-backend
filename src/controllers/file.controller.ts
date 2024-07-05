import { NextFunction, Request, Response } from "express";
import { posix } from 'path'
import { createHash } from "crypto";
import { createReadStream, createWriteStream, readFileSync } from "fs";
import axios from "axios";
import { fromFile } from "file-type";
import FileModel from "../models/file.model";
import { load } from "cheerio";
import { last } from "lodash";
import config from "../configs/env";

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

const ipfsRegExp = /^ipfs:\/\/(.+)$/

async function cacheFileFromUrl(url: string) {
    // ipfs
    if (url.startsWith('ipfs://')) url = posix.join(config.IPFS_GATEWAY, ipfsRegExp.exec(url)![1])

    // meebits
    if (url.startsWith("https://turnon.meebits.app/viewer/")) url = "https://livingpfp.meebits.app/api/meebits?type=3d&token_id=" + last(url.split("/"));

    const existedFile = await FileModel.findById(url)

    if (existedFile) return existedFile;

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
        const fileContent = readFileSync(path, 'utf8');
        if (isJSON(fileContent)) {
            fileType = {
                ext: "json",
                mime: "application/json"
            }
        } if (isHTML(fileContent)) {
            fileType = {
                ext: "html",
                mime: "text/html"
            }
        } else {
            throw new Error("invalidType")
        }
    }

    return await FileModel.create({ _id: url, mime: fileType.mime, path: id })
}

function isJSON(content: string) {
    try {
        JSON.parse(content);
        return true;
    } catch (error) {
        return false;
    }
}

function isHTML(content: string) {
    try {
        load(content);
        return true;
    } catch (error) {
        return false;
    }
}