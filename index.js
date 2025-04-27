const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const replicate = require('replicate');
const app = express();
const upload = multer();
require('dotenv').config();

app.use(cors());
app.use(express.json());

const replicateClient = new replicate({
    auth: process.env.REPLICATE_API_TOKEN
});

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

        const prompt = `Generate a logo for brand "${brandName}" with style "${style}". Keywords: ${keywords}. Prefer colors: ${Array.isArray(colors) ? colors.join(', ') : colors}.`;

        const output = await replicateClient.run(
            "timothybrooks/instruct-pix2pix:9d71e50f9344f03a3b5db5786efc0eb06c865b6db92712c28aa06d8a44f4a5bb",
            {
                input: {
                    image: imageUrl,
                    prompt: prompt
                }
            }
        );

        res.json({ 
            prediction: output,  // 这是图片生成地址数组
            brandName: brandName,
            tagline: tagline
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: "Failed to process request", 
            details: error.response ? error.response.data : error.message 
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
