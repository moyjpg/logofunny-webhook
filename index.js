const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const { Replicate } = require('replicate');
require('dotenv').config();

const app = express();
const upload = multer();
app.use(cors());
app.use(express.json());

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
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

        const output = await replicate.run(
            "timothybrooks/instruct-pix2pix:30c10db916af8efe20493f5d61ee27491ab2a60437c13c588468b9810ec23f", 
            {
                input: {
                    image: imageUrl,
                    prompt: prompt
                }
            }
        );

        res.json({ 
            prediction: output,
            brandName,
            tagline
        });

    } catch (error) {
        console.error('Error details:', error?.response?.data || error.message || error);
        res.status(500).json({ 
            error: "Failed to process request", 
            details: error?.response?.data || error.message 
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
