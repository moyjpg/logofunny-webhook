const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const app = express();
const upload = multer();
require('dotenv').config();

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

        const prompt = `Create a modern logo for the brand "${brandName}". Tagline: "${tagline}". Keywords: ${keywords}. Preferred colors: ${Array.isArray(colors) ? colors.join(', ') : colors}. Style: ${style}.`;

        const response = await axios.post(
            'https://api.replicate.com/v1/predictions',
            {
                version: "67ed00e8", // 👈 用logoai模型的版本
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

        const outputUrl = response.data?.prediction?.output?.[0] || null;

        res.json({ 
            brand: brandName,
            tagline: tagline,
            image: outputUrl
        });
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
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
