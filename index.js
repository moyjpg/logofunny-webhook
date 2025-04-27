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

        const prompt = `Generate a logo for brand \"${brandName}\" with style \"${style}\". Keywords: ${keywords}. Prefer colors: ${Array.isArray(colors) ? colors.join(', ') : colors}.`;

        const response = await axios.post(
            'https://api.replicate.com/v1/predictions',
            {
                version: "7be03b29380c20d0575a5d25e2a3c5421fb63b87e8ef7fada2b2a73748c2ec85",
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

        res.json({ prediction: response.data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to process request", details: error.response ? error.response.data : error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
