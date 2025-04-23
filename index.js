const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
require('dotenv').config();

app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
    const data = req.body;
    const imageUrl = data['upload-1'];
    const brandName = data['textarea-1'];
    const tagline = data['textarea-2'];
    const keywords = data['checkbox-1'];
    const color = data['radio-1'];
    const notes = data['textarea-3'];

    try {
        const response = await axios.post(
            'https://api.replicate.com/v1/predictions',
            {
                version: process.env.REPLICATE_VERSION_ID,
                input: {
                    image: imageUrl,
                    prompt: `${brandName}, ${tagline}, ${keywords}, ${color}, ${notes}`,
                }
            },
            {
                headers: {
                    'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({ status: 'success', prediction: response.data });
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
