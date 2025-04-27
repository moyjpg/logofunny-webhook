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

        const prompt = `Generate a logo for brand "${brandName}" with style "${style}". Keywords: ${keywords}. Prefer colors: ${Array.isArray(colors) ? colors.join(', ') : colors}.`;

        const response = await axios.post(
            'https://api.replicate.com/v1/predictions',
            {
                version: "你用的正确模型的version ID", // ★★★ 记得填正确的 ★★★
                input: {
                    image: imageUrl,
                    prompt: prompt
                }
            },
            {
                headers: {
                    Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const prediction = response.data;

        res.json({
            brandName: brandName,
            tagline: tagline,
            imageUrl: prediction?.output ? prediction.output[0] : null,
            predictionRaw: prediction // 如果你前端想调试或者需要更多数据，这里也留着
        });
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
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
