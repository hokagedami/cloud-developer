import fs from "fs";
import Jimp = require("jimp");
import * as path from "path";
import {promises as fsPromises} from 'fs';

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
const filterImageFromURL = async (inputURL: string): Promise<string> => {

    return Jimp.read(inputURL)
        .then(async (image) => {
            const folder = __dirname + process.env.FILE_FOLDER;
            const folderExist = fs.existsSync(folder);
            switch (folderExist) {
                case true:
                    const files = await fsPromises.readdir(folder);
                    for (const file of files) {
                        await fsPromises.unlink(path.resolve(folder, file));
                    }
                    break;
                case false:
                    fs.mkdirSync(folder);
                    break;

            }
            const out_path =
                folder +"\\filtered_image" + new Date().getTime() + '.' + image.getExtension();
            await image
                .resize(256, 256) // resize
                .quality(60) // set JPEG quality
                .greyscale() // set greyscale
                .writeAsync(out_path);
            return out_path;
        })
        .catch(e => {
            return e.message;
        })
}

const deleteLocalFiles = async (files: Array<string>): Promise<void> => {
  for (let file of files) {
    fs.unlinkSync(file);
  }
}

export  {
  deleteLocalFiles,
    filterImageFromURL
}
