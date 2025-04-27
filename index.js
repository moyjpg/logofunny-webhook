const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const upload = multer();
app.use(cors());
app.use(express.json());

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

        const prompt = `
        Create a professional logo for a brand named "${brandName}" with the tagline "${tagline}". 
        Design style: ${style}. 
        Color preferences: ${Array.isArray(colors) ? colors.join(', ') : colors}. 
        Keywords to guide the design: ${keywords}.
        `;

        const replicateResponse = await axios.post(
            'https://api.replicate.com/v1/predictions',
            {
                version: "你的LogoAI模型version ID", 
                input: {
                    prompt: prompt,
                    image: imageUrl
                }
            },
            {
                headers: {
                    Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const outputUrl = replicateResponse.data?.prediction?.output || replicateResponse.data?.output;

        res.json({
            brand: brandName,
            tagline: tagline,
            logo_url: outputUrl
        });

    } catch (error) {
        console.error('Error details:', error?.response?.data || error.message);
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
