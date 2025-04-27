const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const app = express();
const upload = multer();
require('dotenv').config();

app.use(cors());
app.use(express.json());

async function fetchImageAsBase64(imageUrl) {
    const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer'
    });
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    const contentType = response.headers['content-type'];
    return `data:${contentType};base64,${base64}`;
}

app.post('/webhook', upload.none(), async (req, res) => {
    try {
        const { 
            ['upload-1']: imageUrl,
            ['textarea-1']: brandName,
            ['textarea-2']: tagline,
            ['checkbox-1']: colors,
            ['radio-1']: style,
            ['textarea-3']: keywords
        } = req.body;

        const prompt = `Generate a logo for brand "${brandName}" with style "${style}". Keywords: ${keywords}. Prefer colors: ${Array.isArray(colors) ? colors.join(', ') : colors}. Tagline: ${tagline}`;

        if (!process.env.REPLICATE_API_TOKEN) {
            throw new Error('Missing Replicate API Token');
        }

        console.log("Downloading image and converting to base64...");
        const base64Image = await fetchImageAsBase64(imageUrl);

        const replicateResponse = await axios.post(
            'https://api.replicate.com/v1/predictions',
            {
                version: "30c10db916a6f8efce20493f5d61ee27491ab2a60437c13c588468b9810ec23f",
                input: {
                    image: base64Image,
                    prompt: prompt,
                    controlnet_conditioning_scale: 1.2,
                    guess_mode: true
                }
            },
            {
                headers: {
                    Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({ prediction: replicateResponse.data });
    } catch (error) {
        console.error("Error during webhook handling:", error);

        if (error.response) {
            res.status(error.response.status).json({
                error: "Replicate API returned an error",
                details: error.response.data
            });
        } else if (error.request) {
            res.status(500).json({
                error: "No response from Replicate API",
                details: error.message
            });
        } else {
            res.status(500).json({
                error: "Unexpected error",
                details: error.message
            });
        }
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
