const cloudinary = require('cloudinary');
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_APT_SECRET
})

const UploadImage = async (filetoupload) => {
    try {
        const data = await cloudinary.uploader.upload(filetoupload, { resource_type: 'auto' });
        return data;
    } catch (error) {
        return error;
    }


}
const RemoveImage = async (imagepublicid) => {
    try {
        const result = await cloudinary.uploader.distory(imagepublicid);
        return result;
    } catch (error) {
        return error;
    }


}
const RemoveImagemany = async (imagepublicides) => {
    try {
        const result = await cloudinary.v2.api.delete_resources(imagepublicides);
        return result;
    } catch (error) {
        return error;
    }


}
module.exports = {
    UploadImage,
    RemoveImage,
    RemoveImagemany
}

