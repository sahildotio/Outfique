import Imagekit, { ImageKit } from "@imagekit/nodejs"
import configure from "../config/config.js"

const client = new ImageKit({
  privatekey: configure.IMAGEKIT_PRIVATE_KEY,
  publickey: configure.IMAGEKIT_PUBLIC_KEY,
  URLEndpoint: configure.IMAGEKIT_URL_ENDPOINT,
});

export const uploadImage = async ({ buffer, fileName, folder= "Outfique"}) => {
    try {
        const response = await client.files.upload({
            file: await ImageKit.toFile(buffer),
            fileName,
            folder
        })
        return response
    } catch (error) {
        throw new Error(error.message)
    }
}

export const deleteImage = async (fileId) => {
    await client.files.delete(fileId)
    return true
}