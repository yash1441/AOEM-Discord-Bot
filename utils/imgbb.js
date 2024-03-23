const axios = require('axios');
require('dotenv').config();

async function uploadImage(url) {
    const options = {
        method: 'POST',
        url: 'https://api.imgbb.com/1/upload',
        params: {
            key: process.env.IMGBB_API,
            image: url
        }
    };

    const response = await axios.request(options);

    return response.data?.data?.url;
}

module.exports = uploadImage;